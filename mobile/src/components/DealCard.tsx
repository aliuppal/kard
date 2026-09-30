import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme, radius } from '../theme';
import { Deal, catOf, BANK_BY_ID, schedLabel, daysLeft } from '../lib/deals';
import { dayDiff, fmt, plural, today as todayFn } from '../lib/dates';
import { categoryIcon } from '../lib/categoryIcons';
import { Card } from '../lib/wallet';

// "15% off" → big "15%" + "off"; "Rs 4/L off" → "Rs 4/L" + "off"; anything else stays whole.
const OFFER_RE = /^(\d+(?:\.\d+)?%|Rs\s?[\d,]+(?:\/\w+)?)\s*(.*)$/;

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
  const om = OFFER_RE.exec(deal.offer || '');

  let timing: { label: string; warn: boolean } | null = null;
  if (startsIn > 0) timing = { label: `Starts in ${plural(startsIn, 'day')}`, warn: false };
  else if (deal.hasEnd) {
    if (left < 0) timing = { label: 'Expired', warn: true };
    else if (left <= 5) timing = { label: left === 0 ? 'Ends today' : `Ends in ${plural(left, 'day')}`, warn: true };
    else timing = { label: `Valid till ${fmt(deal.until)}`, warn: false };
  }

  const fact = (icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'], text: string) => (
    <View style={styles.fact}>
      <MaterialCommunityIcons name={icon} size={15} color={t.muted} style={{ marginTop: 1 }} />
      <Text style={[styles.factText, { color: t.ink2 }]}>{text}</Text>
    </View>
  );

  return (
    <View style={[styles.card, { backgroundColor: t.surface, borderColor: mine.length ? t.brandSoft : 'transparent' }]}>
      <View style={styles.top}>
        <View style={styles.offer}>
          {om ? (
            <>
              <Text style={[styles.offerBig, { color: t.brandText }]}>{om[1]}</Text>
              {!!om[2] && <Text style={[styles.offerRest, { color: t.ink2 }]}>{om[2]}</Text>}
            </>
          ) : (
            <Text style={[styles.offerWords, { color: t.brandText }]}>{deal.offer}</Text>
          )}
        </View>
        <View style={[styles.avatar, { backgroundColor: cat.color + '22' }]}>
          <MaterialCommunityIcons name={categoryIcon(cat.id)} size={20} color={cat.color} />
        </View>
      </View>

      <View>
        <Text style={[styles.merchant, { color: t.ink }]} numberOfLines={1}>{deal.m}</Text>
        <Text style={[styles.cat, { color: t.muted }]}>{cat.name}</Text>
      </View>

      <View style={[styles.facts, { borderTopColor: t.line }]}>
        {fact('calendar-blank-outline', schedLabel(deal))}
        {fact('map-marker-outline', cities)}
        {!!limits && fact('cash-multiple', limits)}
      </View>

      <View style={styles.tags}>
        {shown.map(id => {
          const b = BANK_BY_ID[id];
          const has = mineBanks.has(id);
          return (
            <View key={id} style={[styles.chip, { backgroundColor: has ? t.ink : t.sunk }]}>
              <View style={[styles.dot, { backgroundColor: b.color }]} />
              <Text style={[styles.chipText, { color: has ? t.onInk : t.ink2 }]}>{b.short}</Text>
              {has && <MaterialCommunityIcons name="check" size={12} color={t.onInk} />}
            </View>
          );
        })}
        {banks.length > shown.length && (
          <View style={[styles.chip, { backgroundColor: t.sunk }]}><Text style={[styles.chipText, { color: t.muted }]}>+{banks.length - shown.length}</Text></View>
        )}
        <View style={[styles.chip, { backgroundColor: t.sunk }]}>
          <Text style={[styles.chipText, { color: t.muted, fontWeight: '500' }]}>{types}{deal.nets ? ` · ${deal.nets.join('/')} only` : ''}</Text>
        </View>
        {timing && (
          <View style={[styles.chip, { backgroundColor: timing.warn ? t.warnSoft : t.sunk }]}>
            <Text style={[styles.chipText, { color: timing.warn ? t.warn : t.muted, fontWeight: timing.warn ? '700' : '500' }]}>{timing.label}</Text>
          </View>
        )}
      </View>

      <Pressable onPress={() => setOpen(o => !o)} hitSlop={8} style={styles.termsRow} accessibilityRole="button" accessibilityState={{ expanded: open }}>
        <Text style={[styles.termsToggle, { color: t.ink2 }]}>Terms</Text>
        <MaterialCommunityIcons name={open ? 'minus' : 'plus'} size={14} color={t.muted} />
      </Pressable>
      {open && <Text style={[styles.terms, { color: t.muted }]}>{deal.terms || 'See merchant for details.'}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1.5, borderRadius: radius, padding: 16, paddingBottom: 12, gap: 12,
    shadowColor: '#3c2814', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 }, elevation: 2,
  },
  top: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  offer: { flexDirection: 'row', alignItems: 'baseline', flexWrap: 'wrap', columnGap: 6, flex: 1 },
  offerBig: { fontSize: 38, fontWeight: '800', letterSpacing: -1.6, lineHeight: 40, fontVariant: ['tabular-nums'] },
  offerRest: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  offerWords: { fontSize: 24, fontWeight: '800', letterSpacing: -0.8, lineHeight: 28 },
  avatar: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  merchant: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  cat: { fontSize: 13, marginTop: 2 },
  facts: { gap: 5, paddingTop: 12, borderTopWidth: 1, borderStyle: 'dashed' },
  fact: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  factText: { fontSize: 13.5, flex: 1 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  dot: { width: 7, height: 7, borderRadius: 2 },
  chipText: { fontSize: 11.5, fontWeight: '600' },
  termsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start' },
  termsToggle: { fontSize: 13, fontWeight: '600' },
  terms: { fontSize: 13, lineHeight: 18, marginTop: -4 },
});
