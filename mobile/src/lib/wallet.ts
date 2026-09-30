// Card wallet storage — the mobile twin of app.js's card handling.
// Signed out: cards live on-device only (AsyncStorage).
// Signed in: cards live in Supabase's `user_cards` table and follow the
// account to any device, including the web app.
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export type CardType = 'credit' | 'debit';

export interface Card {
  id: string | number;
  bank: string;
  product?: string; // id from catalog products; empty = other / not listed
  type: CardType;
  network: string;
  name: string;
  last4: string;
}

const LOCAL_KEY = 'kard.cards';

export async function getLocalCards(): Promise<Card[]> {
  try {
    const raw = await AsyncStorage.getItem(LOCAL_KEY);
    const cards = raw ? JSON.parse(raw) : [];
    return Array.isArray(cards) ? cards : [];
  } catch {
    return [];
  }
}

export async function setLocalCards(cards: Card[]): Promise<void> {
  try {
    await AsyncStorage.setItem(LOCAL_KEY, JSON.stringify(cards));
  } catch {
    // storage unavailable — guest cards just won't persist across restarts
  }
}

const fromRow = (r: any): Card => ({
  id: r.id,
  bank: r.bank,
  product: r.product || '',
  type: r.card_type,
  network: r.network || '',
  name: r.nickname || '',
  last4: r.last4 || '',
});

const toRow = (userId: string, c: Omit<Card, 'id'>) => ({
  user_id: userId,
  bank: c.bank,
  product: c.product || null,
  card_type: c.type,
  network: c.network || null,
  nickname: c.name || null,
  last4: c.last4 || null,
});

/** Loads this account's cards. If the account has none yet but the device has
 *  local guest cards, those are uploaded once so nothing is lost on sign-in. */
export async function syncCardsForUser(userId: string, localCards: Card[]): Promise<Card[]> {
  const { data, error } = await supabase.from('user_cards').select('*').order('id');
  if (error) throw error;
  if (data && data.length) return data.map(fromRow);
  if (localCards.length) {
    const { data: inserted, error: insErr } = await supabase
      .from('user_cards')
      .insert(localCards.map(c => toRow(userId, c)))
      .select();
    if (!insErr && inserted) return inserted.map(fromRow);
  }
  return [];
}

export async function addRemoteCard(userId: string, card: Omit<Card, 'id'>): Promise<Card> {
  const { data, error } = await supabase.from('user_cards').insert(toRow(userId, card)).select();
  if (error) throw error;
  return fromRow(data[0]);
}

export async function deleteRemoteCard(id: string | number): Promise<void> {
  const { error } = await supabase.from('user_cards').delete().eq('id', id);
  if (error) throw error;
}
