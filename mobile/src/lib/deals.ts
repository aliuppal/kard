// Deal loading + schedule matching — the mobile twin of ../../../app.js's
// data layer, kept behaviourally identical so both apps agree on what's on.
import catalog from '../data/catalog.json';
import sampleDealsRaw from '../data/sampleDeals.json';
import realDealsData from '../data/realDeals.json';
import { supabase, isSupabaseConfigured } from './supabase';
import { addDays, dayDiff, listJoin, ord, DAY, fmt, today as todayFn } from './dates';

export type CardType = 'credit' | 'debit';

export interface Deal {
  id: string | number;
  m: string; // merchant
  c: string; // category id
  cities: 'all' | string[];
  banks: string[];
  types: CardType[];
  nets: string[] | null;
  offer: string;
  pct: number;
  max?: string | null;
  min?: string | null;
  sched: { t: 'daily' | 'weekly' | 'monthly' | 'range'; days: number[]; dates: number[] };
  from: Date;
  until: Date;
  hasEnd: boolean;
  terms?: string | null;
  src?: string | null;
}

export type DealSource = 'real' | 'sample' | 'db' | 'fallback';
export const REAL_DEALS_ASOF: string | null = realDealsData.asOf;

const BANK_IDS = new Set(catalog.banks.map(b => b.id));
const FAR = 36500; // "no start / no end" sentinel, in days

const parseDate = (s: string): Date => {
  const [y, m, d] = s.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
};

function fromSample(d: any, i: number, today: Date): Deal {
  const range = d.sched.t === 'range';
  return {
    id: `s${i}`,
    m: d.m,
    c: d.c,
    cities: d.cities,
    banks: d.banks,
    types: d.types || ['credit', 'debit'],
    nets: d.nets || null,
    offer: d.offer,
    pct: d.pct || 0,
    max: d.max,
    min: d.min,
    sched: d.sched,
    from: addDays(today, range ? d.sched.from : -FAR),
    until: addDays(today, range ? d.sched.to : FAR),
    hasEnd: range,
    terms: d.terms,
  };
}

function fromRow(r: any, today: Date): Deal {
  return {
    id: r.id,
    m: r.merchant,
    c: r.category,
    cities: r.all_cities ? 'all' : r.cities || [],
    banks: (r.banks || []).filter((b: string) => BANK_IDS.has(b)),
    types: r.card_types && r.card_types.length ? r.card_types : ['credit', 'debit'],
    nets: r.networks && r.networks.length ? r.networks : null,
    offer: r.offer,
    pct: Number(r.discount_pct) || 0,
    max: r.max_discount,
    min: r.min_spend,
    sched: { t: r.schedule_type, days: r.weekdays || [], dates: r.month_dates || [] },
    from: r.start_date ? parseDate(r.start_date) : addDays(today, -FAR),
    until: r.end_date ? parseDate(r.end_date) : addDays(today, FAR),
    hasEnd: !!r.end_date,
    terms: r.terms,
    src: r.source_url || null,
  };
}

export async function loadDeals(): Promise<{ source: DealSource; deals: Deal[] }> {
  const today = todayFn();
  const sample = () => (sampleDealsRaw as any[]).map((d, i) => fromSample(d, i, today));
  const real = () => (realDealsData.deals as any[]).map((r, i) => fromRow({ id: `r${i}`, ...r }, today)).filter(d => d.banks.length);
  const offline = (): { source: DealSource; deals: Deal[] } => realDealsData.deals.length ? { source: 'real', deals: real() } : { source: 'sample', deals: sample() };
  if (!isSupabaseConfigured) return offline();
  try {
    const { data, error } = await supabase
      .from('deals')
      .select('*')
      .eq('active', true)
      .order('id');
    if (error) throw error;
    const rows = (data || []).map(r => fromRow(r, today)).filter(d => d.banks.length);
    return { source: 'db', deals: rows };
  } catch (err) {
    console.warn('Kard: could not load deals from Supabase, using sample data.', err);
    const o = offline();
    return o.source === 'real' ? o : { source: 'fallback', deals: o.deals };
  }
}

export function occursOn(d: Deal, date: Date): boolean {
  if (date < d.from || date > d.until) return false;
  const s = d.sched;
  if (s.t === 'weekly') return s.days.includes(date.getDay());
  if (s.t === 'monthly') return s.dates.includes(date.getDate());
  return true; // daily & range
}

export function schedLabel(d: Deal): string {
  const s = d.sched;
  if (s.t === 'daily') return 'Every day';
  if (s.t === 'weekly') return `Every ${listJoin(s.days.map(x => DAY[x]))}`;
  if (s.t === 'monthly') return `${listJoin(s.dates.map(ord))} of every month`;
  return `${fmt(d.from)} – ${fmt(d.until)}`;
}

export function daysLeft(d: Deal, today: Date): number {
  return dayDiff(d.until, today);
}

export { catalog };
export const BANKS = catalog.banks;
export const CITIES = catalog.cities;
export const CATEGORIES = catalog.categories;
export const BANK_BY_ID = Object.fromEntries(BANKS.map(b => [b.id, b])) as Record<string, (typeof BANKS)[number]>;
export const CAT_BY_ID = Object.fromEntries(CATEGORIES.map(c => [c.id, c])) as Record<string, (typeof CATEGORIES)[number]>;
export interface CardProduct { id: string; bank: string; name: string; type: CardType; nets: string[]; tier: string; img?: boolean }
export const PRODUCTS = (catalog.products || []) as CardProduct[];
export const PRODUCT_BY_ID = Object.fromEntries(PRODUCTS.map(p => [p.id, p])) as Record<string, CardProduct>;
export const productsOf = (bank: string) => PRODUCTS.filter(p => p.bank === bank);
// Card art is served by the web app (kard/cards/<id>.webp).
const SITE_URL = (process.env.EXPO_PUBLIC_SITE_URL || 'https://kard-drab.vercel.app').replace(/\/$/, '');
export const cardImageUrl = (p: CardProduct) => `${SITE_URL}/cards/${p.id}.webp`;
export const catOf = (id: string) => CAT_BY_ID[id] || { id, name: id, icon: '🏷️', color: '#6b6358' };
