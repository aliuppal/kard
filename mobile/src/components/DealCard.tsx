import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, radius } from '../theme';
import { Deal, catOf, BANK_BY_ID, schedLabel, daysLeft } from '../lib/deals';
import { dayDiff, fmt, plural, today as todayFn } from '../lib/dates';
import { Card } from '../lib/wallet';

export default function DealCard({ deal, mine }: { deal: Deal; mine: Card[] }) {
  const t = useTheme();
  const [open, setOpen] = useState(false);
  const cat = catOf(deal.c);
  const mineBanks = new Set(mine.map(c => c.bank));
  const banks = [...deal.banks].sort((a, b) => (mineBanks.has(b) ? 1 : 0) - (mineBanks.has(a) ? 1 : 0));
  const shown = banks.slice(0, 4);
  const today = todayFn();
  const left = daysLeft(deal, today);
  const startsIn = dayDiff(deal.from, today);
  const cities = deal.cities === 'all'
    ? 'All Pakistan'
    : deal.cities.length > 3 ? `${deal.cities.slice(0, 3).join(', ')} +${deal.cities.length - 3}` : deal.cities.join(', ');
  const types = deal.types.length === 2 ? 'Credit & Debit' : deal.types[0] === 'credit' ? 'Credit' : 'Debit';
  const limits = [deal.max && `Max ${deal.max}`, deal.min && `Min spend ${deal.min}`].filter(Boolean).join(' · ');

  let timing: { label: string; warn: boolean } | null = null;
  if (startsIn > 0) timing = { label: `Starts in ${plural(startsIn, 'day')}`, warn: false };
  else if (deal.hasEnd) {
    if (left < 0) timing = { label: 'Expired', warn: true };
    else if (left <= 5) timing = { label: left === 0 ? 'Ends today' : `Ends in ${plural(left, 'day')}`, warn: true };
    else timing = { label: `Valid till ${fmt(deal.until)}`, warn: false };
  }

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: mine.length ? t.brand : t.line }]}>
      <View style={styles.top}>
        <View style={[styles.avatar, { backgroundColor: cat.color + '29' }]}><Text style={styles.avatarIcon}>{cat.icon}</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.merchant, { color: t.ink }]} numberOfLines={1}>{deal.m}</Text>
          <Text style={[styles.cat, { color: t.muted }]}>{cat.name}</Text>
        </View>
        <View style={[styles.offer, { backgroundColor: t.brandSoft }]}>
          <Text style={[styles.offerText, { color: t.brand }]}>{deal.offer}</Text>
        </View>
      </View>

      <View style={styles.facts}>
        <Text style={[styles.fact, { color: t.muted }]}>🗓 {schedLabel(deal)}</Text>
        <Text style={[styles.fact, { color: t.muted }]}>📍 {cities}</Text>
        {!!limits && <Text style={[styles.fact, { color: t.muted }]}>💰 {limits}</Text>}
      </View>

      <View style={styles.tags}>
        {shown.map(id => {
          const b = BANK_BY_ID[id];
          const has = mineBanks.has(id);
          return (
            <View key={id} style={[styles.bankChip, { borderColor: has ? t.brand : t.line, backgroundColor: has ? t.brandSoft : 'transparent' }]}>
              <View style={[styles.dot, { backgroundColor: b.color }]} />
              <Text style={[styles.chipText, { color: t.ink }]}>{b.short}{has ? ' ✓' : ''}</Text>
            </View>
          );
        })}
        {banks.length > shown.length && (
          <View style={[styles.tag, { borderColor: t.line }]}><Text style={[styles.chipText, { color: t.muted }]}>+{banks.length - shown.length}</Text></View>
        )}
        <View style={[styles.tag, { borderColor: t.line }]}>
          <Text style={[styles.chipText, { color: t.muted }]}>{types}{deal.nets ? ` · ${deal.nets.join('/')} only` : ''}</Text>
        </View>
        {timing && (
          <View style={[styles.tag, timing.warn ? { backgroundColor: t.warnSoft, borderColor: 'transparent' } : { borderColor: t.line }]}>
            <Text style={[styles.chipText, { color: timing.warn ? t.warn : t.muted, fontWeight: timing.warn ? '700' : '500' }]}>{timing.label}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={() => setOpen(o => !o)} hitSlop={6}>
        <Text style={[styles.termsToggle, { color: t.ink }]}>{open ? '▾' : '▸'} Terms</Text>
      </Pressable>
      {open && <Text style={[styles.terms, { color: t.muted }]}>{deal.terms || 'See merchant for details.'}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: radius, padding: 14, gap: 10 },
  top: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  avatarIcon: { fontSize: 20 },
  merchant: { fontSize: 16, fontWeight: '700' },
  cat: { fontSize: 12.5, marginTop: 1 },
  offer: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 9 },
  offerText: { fontWeight: '800', fontSize: 14 },
  facts: { gap: 3 },
  fact: { fontSize: 13 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  bankChip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  tag: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontSize: 11.5, fontWeight: '600' },
  termsToggle: { fontSize: 13, fontWeight: '600' },
  terms: { fontSize: 13, lineHeight: 18, marginTop: -4 },
});
