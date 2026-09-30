// Central app state: deals, wallet, auth/profile and filters — the mobile
// twin of the plain-object `state` in ../../../app.js, as a React context so
// every screen reads and updates the same source of truth.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { loadDeals, Deal, DealSource, BANKS, CITIES, CAT_BY_ID } from '../lib/deals';
import { Card, getLocalCards, setLocalCards, syncCardsForUser, addRemoteCard, deleteRemoteCard } from '../lib/wallet';
import { today as todayFn } from '../lib/dates';

export type ViewKind = 'daily' | 'weekly' | 'monthly';
export type SortKind = 'best' | 'ending' | 'az';

export interface Filters {
  city: string; // 'all' | one of CITIES
  cat: string; // 'all' | category id
  type: 'all' | 'credit' | 'debit';
  bank: string; // 'all' | bank id
  sort: SortKind;
  q: string;
  mine: boolean;
}

export interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
}

const BANK_IDS = new Set(BANKS.map(b => b.id));
const defaultFilters: Filters = { city: 'all', cat: 'all', type: 'all', bank: 'all', sort: 'best', q: '', mine: true };

interface AppValue {
  // deals
  deals: Deal[];
  dealsSource: DealSource | null;
  dealsLoading: boolean;
  // filters / navigation
  view: ViewKind;
  setView: (v: ViewKind) => void;
  anchor: Date;
  setAnchor: (d: Date) => void;
  filters: Filters;
  setFilters: (patch: Partial<Filters>) => void;
  clearFilters: () => void;
  // wallet
  cards: Card[];
  cardsLoading: boolean;
  addCard: (c: Omit<Card, 'id'>) => Promise<void>;
  addDemoCards: () => Promise<void>;
  removeCard: (id: string | number) => Promise<void>;
  matchCards: (d: Deal) => Card[];
  useMine: () => boolean;
  // auth
  session: Session | null;
  profile: Profile | null;
  authReady: boolean;
  signOut: () => Promise<void>;
  setProfileCity: (city: string) => Promise<void>;
}

const AppCtx = createContext<AppValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [dealsSource, setDealsSource] = useState<DealSource | null>(null);
  const [dealsLoading, setDealsLoading] = useState(true);

  const [view, setViewState] = useState<ViewKind>('daily');
  const [anchor, setAnchor] = useState<Date>(todayFn());
  const [filters, setFiltersState] = useState<Filters>(defaultFilters);
  const hydrated = useRef(false);

  const [cards, setCards] = useState<Card[]>([]);
  const [cardsLoading, setCardsLoading] = useState(true);

  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authReady, setAuthReady] = useState(!isSupabaseConfigured);

  // Load deals once.
  useEffect(() => {
    loadDeals().then(({ source, deals: loaded }) => {
      setDeals(loaded);
      setDealsSource(source);
      setDealsLoading(false);
    });
  }, []);

  // Hydrate persisted filters/view, then load guest (local) cards.
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem('kard.prefs');
        if (raw) {
          const p = JSON.parse(raw);
          if (p.view) setViewState(p.view);
          setFiltersState(f => ({ ...f, city: p.city ?? f.city, cat: p.cat ?? f.cat, mine: p.mine ?? f.mine }));
        }
      } catch {
        // ignore corrupt prefs
      }
      hydrated.current = true;
      if (!session) {
        const local = await getLocalCards();
        setCards(local);
        setCardsLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist view/city/cat/mine (mirrors app.js's localStorage prefs).
  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem('kard.prefs', JSON.stringify({ view, city: filters.city, cat: filters.cat, mine: filters.mine })).catch(() => {});
  }, [view, filters.city, filters.cat, filters.mine]);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
    if (!error && data) setProfile(data as Profile);
  }, []);

  // Auth: watch session, sync cards on sign-in, revert to local cards on sign-out.
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    let cancelled = false;

    supabase.auth.getSession().then(async ({ data }) => {
      if (cancelled) return;
      setSession(data.session);
      setAuthReady(true);
      if (data.session) {
        setCardsLoading(true);
        const local = await getLocalCards();
        try {
          const merged = await syncCardsForUser(data.session.user.id, local);
          if (!cancelled) setCards(merged);
        } catch (err) {
          console.warn('Kard: could not load your saved cards.', err);
        }
        setCardsLoading(false);
        loadProfile(data.session.user.id);
      } else {
        const local = await getLocalCards();
        if (!cancelled) { setCards(local); setCardsLoading(false); }
      }
    });

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (event === 'INITIAL_SESSION') return;
      setSession(sess);
      if (event === 'SIGNED_IN' && sess) {
        setCardsLoading(true);
        const local = await getLocalCards();
        try {
          const merged = await syncCardsForUser(sess.user.id, local);
          setCards(merged);
        } catch (err) {
          console.warn('Kard: could not load your saved cards.', err);
        }
        setCardsLoading(false);
        loadProfile(sess.user.id);
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        const local = await getLocalCards();
        setCards(local);
      }
    });

    return () => { cancelled = true; sub.subscription.unsubscribe(); };
  }, [loadProfile]);

  const setFilters = useCallback((patch: Partial<Filters>) => setFiltersState(f => ({ ...f, ...patch })), []);
  const clearFilters = useCallback(() => setFiltersState(defaultFilters), []);

  const matchCards = useCallback(
    (d: Deal) => cards.filter(c => d.banks.includes(c.bank) && d.types.includes(c.type) && (!d.nets || d.nets.includes(c.network))),
    [cards]
  );
  const useMine = useCallback(() => filters.mine && cards.length > 0, [filters.mine, cards.length]);

  const addCard = useCallback(async (c: Omit<Card, 'id'>) => {
    if (session) {
      const row = await addRemoteCard(session.user.id, c);
      setCards(prev => [...prev, row]);
    } else {
      setCards(prev => {
        const next = [...prev, { ...c, id: Date.now() }];
        setLocalCards(next);
        return next;
      });
    }
  }, [session]);

  const addDemoCards = useCallback(async () => {
    const demo: Omit<Card, 'id'>[] = [
      { bank: 'hbl', product: 'hbl-platinum-cc', type: 'credit', network: 'Visa', name: '', last4: '' },
      { bank: 'alfalah', product: 'alf-gold-dc', type: 'debit', network: 'Visa', name: '', last4: '' },
      { bank: 'meezan', product: 'meezan-titanium-dc', type: 'debit', network: 'Mastercard', name: '', last4: '' },
      { bank: 'sadapay', product: 'sp-mastercard-dc', type: 'debit', network: 'Mastercard', name: '', last4: '' },
    ];
    for (const c of demo) await addCard(c);
  }, [addCard]);

  const removeCard = useCallback(async (id: string | number) => {
    if (session) await deleteRemoteCard(id);
    setCards(prev => {
      const next = prev.filter(c => String(c.id) !== String(id));
      if (!session) setLocalCards(next);
      return next;
    });
  }, [session]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const setProfileCity = useCallback(async (city: string) => {
    if (!session) return;
    const { data, error } = await supabase.from('profiles').update({ city }).eq('id', session.user.id).select().maybeSingle();
    if (!error && data) setProfile(data as Profile);
  }, [session]);

  const value: AppValue = useMemo(() => ({
    deals, dealsSource, dealsLoading,
    view, setView: setViewState, anchor, setAnchor,
    filters, setFilters, clearFilters,
    cards, cardsLoading, addCard, addDemoCards, removeCard, matchCards, useMine,
    session, profile, authReady, signOut, setProfileCity,
  }), [deals, dealsSource, dealsLoading, view, anchor, filters, setFilters, clearFilters, cards, cardsLoading, addCard, addDemoCards, removeCard, matchCards, useMine, session, profile, authReady, signOut, setProfileCity]);

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp(): AppValue {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp() must be used inside <AppProvider>');
  return ctx;
}

export { BANK_IDS, CITIES, CAT_BY_ID };
