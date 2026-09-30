import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../src/theme';
import { useApp } from '../../src/context/AppContext';
import { filterDeals, sortDeals, activeFilterCount } from '../../src/lib/filterDeals';
import { occursOn, Deal } from '../../src/lib/deals';
import { addDays, dayDiff, fmt, fmtLong, sameDay, mondayOf, plural, DAY_FULL, MON_FULL, today as todayFn } from '../../src/lib/dates';
import DealCard from '../../src/components/DealCard';
import Notice from '../../src/components/Notice';
import EmptyState from '../../src/components/EmptyState';
import Segmented from '../../src/components/Segmented';
import NavHeader from '../../src/components/NavHeader';
import CategoryChips from '../../src/components/CategoryChips';
import FiltersModal from '../../src/components/FiltersModal';

const today = todayFn();

function summary(n: number, label: string, city: string, mine: boolean) {
  const where = city === 'all' ? 'across Pakistan' : `in ${city}`;
  const whom = mine ? 'for your cards' : 'from all banks';
  return `${plural(n, 'deal')} ${label} ${where}, ${whom}`;
}

export default function DealsScreen() {
  const t = useTheme();
  const { deals, dealsSource, dealsLoading, view, setView, anchor, setAnchor, filters, matchCards, useMine, clearFilters } = useApp();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const mine = useMine();
  const base = useMemo(() => sortDeals(filterDeals(deals, filters, matchCards, mine), filters.sort), [deals, filters, matchCards, mine]);
  const hasActiveFilters = activeFilterCount(filters) > 0 || mine;
  const badge = activeFilterCount(filters);

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <View style={styles.controls}>
        <View style={styles.controlsRow}>
          <View style={{ flex: 1 }}><Segmented value={view} onChange={setView} options={[
            { value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' },
          ]} /></View>
          <Pressable onPress={() => setFiltersOpen(true)} style={[styles.filterBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
            <Text style={{ color: t.ink, fontWeight: '700' }}>Filters</Text>
            {badge > 0 && <View style={[styles.badge, { backgroundColor: t.brand }]}><Text style={{ color: t.brandInk, fontSize: 11, fontWeight: '700' }}>{badge}</Text></View>}
          </Pressable>
        </View>
        <CategoryChips />
      </View>

      {dealsLoading ? (
        <View style={styles.loading}><ActivityIndicator color={t.brand} /><Text style={{ color: t.muted, marginTop: 8 }}>Loading deals…</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
          <Notice source={dealsSource} />
          {view === 'daily' && <Daily base={base} anchor={anchor} setAnchor={setAnchor} filters={filters} mine={mine} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} matchCards={matchCards} />}
          {view === 'weekly' && <Weekly base={base} anchor={anchor} setAnchor={setAnchor} filters={filters} mine={mine} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} matchCards={matchCards} />}
          {view === 'monthly' && <Monthly base={base} anchor={anchor} setAnchor={setAnchor} filters={filters} mine={mine} hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} matchCards={matchCards} />}
        </ScrollView>
      )}

      <FiltersModal visible={filtersOpen} onClose={() => setFiltersOpen(false)} />
    </View>
  );
}

type ViewProps = {
  base: Deal[]; anchor: Date; setAnchor: (d: Date) => void; filters: any; mine: boolean; hasActiveFilters: boolean;
  clearFilters: () => void; matchCards: (d: Deal) => any[];
};

function SectionTitle({ label, count }: { label: string; count: number }) {
  const t = useTheme();
  return <Text style={[styles.sectionTitle, { color: t.ink }]}>{label} <Text style={{ color: t.muted, fontWeight: '400' }}>{count}</Text></Text>;
}

function List({ items, matchCards }: { items: Deal[]; matchCards: (d: Deal) => any[] }) {
  return <View style={{ paddingHorizontal: 16, gap: 12 }}>{items.map(d => <DealCard key={d.id} deal={d} mine={matchCards(d)} />)}</View>;
}

function Empty({ message, hasActiveFilters, clearFilters }: { message: string; hasActiveFilters: boolean; clearFilters: () => void }) {
  return <EmptyState message={message} actionLabel={hasActiveFilters ? 'Clear filters' : undefined} onAction={hasActiveFilters ? clearFilters : undefined} />;
}

function Daily({ base, anchor, setAnchor, filters, mine, hasActiveFilters, clearFilters, matchCards }: ViewProps) {
  const all = base.filter(d => occursOn(d, anchor));
  const special = all.filter(d => d.sched.t !== 'daily');
  const every = all.filter(d => d.sched.t === 'daily');
  const title = sameDay(anchor, today) ? `Today · ${fmtLong(anchor)}` : fmtLong(anchor);
  return (
    <View>
      <NavHeader title={title} sub={summary(all.length, 'on', filters.city, mine)}
        onPrev={() => setAnchor(addDays(anchor, -1))} onNext={() => setAnchor(addDays(anchor, 1))} onToday={() => setAnchor(today)} todayLabel="Today" />
      {!all.length ? <Empty message="No deals match on this day. Try another day or loosen the filters." hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} /> : (
        <>
          {special.length > 0 && <><SectionTitle label={sameDay(anchor, today) ? 'Only today' : 'Only this day'} count={special.length} /><List items={special} matchCards={matchCards} /></>}
          {every.length > 0 && <View style={{ marginTop: 16 }}><SectionTitle label="Everyday offers" count={every.length} /><List items={every} matchCards={matchCards} /></View>}
        </>
      )}
    </View>
  );
}

function Weekly({ base, anchor, setAnchor, filters, mine, hasActiveFilters, clearFilters, matchCards }: ViewProps) {
  const start = mondayOf(anchor);
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i));
  const perDay = days.map(d => base.filter(x => x.sched.t !== 'daily' && occursOn(x, d)));
  const every = base.filter(x => x.sched.t === 'daily' && days.some(d => occursOn(x, d)));
  const total = new Set([...perDay.flat(), ...every].map(d => d.id)).size;
  const title = `${fmt(days[0])} – ${fmt(days[6])}` + (days.some(d => sameDay(d, today)) ? ' · This week' : '');
  const t = useTheme();
  return (
    <View>
      <NavHeader title={title} sub={summary(total, 'this week', filters.city, mine)}
        onPrev={() => setAnchor(addDays(anchor, -7))} onNext={() => setAnchor(addDays(anchor, 7))} onToday={() => setAnchor(today)} todayLabel="This week" />
      {!total ? <Empty message="No deals match this week. Try another week or loosen the filters." hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} /> : (
        <>
          {every.length > 0 && <><SectionTitle label="Every day this week" count={every.length} /><List items={every} matchCards={matchCards} /></>}
          <View style={{ marginTop: 16, paddingHorizontal: 16 }}>
            <Text style={[styles.sectionTitle, { color: t.ink, marginBottom: 10 }]}>Day by day</Text>
          </View>
          {days.map((d, i) => (
            <View key={i} style={[styles.dayCol, { borderColor: sameDay(d, today) ? t.brand : 'transparent', backgroundColor: t.sunk }]}>
              <Text style={[styles.dayTitle, { color: t.ink }]}>{DAY_FULL[d.getDay()]} <Text style={{ color: t.muted, fontWeight: '400', fontSize: 12.5 }}>{fmt(d)} · {perDay[i].length}</Text></Text>
              {perDay[i].length ? perDay[i].map(dl => <DealCard key={dl.id} deal={dl} mine={matchCards(dl)} />) : <Text style={{ color: t.muted, fontSize: 13 }}>No day-specific deals.</Text>}
            </View>
          ))}
        </>
      )}
    </View>
  );
}

function Monthly({ base, anchor, setAnchor, filters, mine, hasActiveFilters, clearFilters, matchCards }: ViewProps) {
  const t = useTheme();
  const y = anchor.getFullYear(), m = anchor.getMonth();
  const first = new Date(y, m, 1);
  const count = new Date(y, m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7;
  const perDay: Record<number, Deal[]> = {};
  for (let n = 1; n <= count; n++) perDay[n] = base.filter(d => occursOn(d, new Date(y, m, n)));
  const monthDeals = base.filter(d => d.from <= new Date(y, m, count) && d.until >= first);

  const cells: React.ReactNode[] = [];
  for (let i = 0; i < lead; i++) cells.push(<View key={`b${i}`} style={styles.calCell} />);
  for (let n = 1; n <= count; n++) {
    const date = new Date(y, m, n);
    const isToday = sameDay(date, today);
    const isPast = date < today;
    const isSel = n === anchor.getDate();
    cells.push(
      <Pressable
        key={n}
        onPress={() => setAnchor(new Date(y, m, n))}
        style={[styles.calCell, styles.calDay, { borderColor: isSel ? t.ink : 'transparent', backgroundColor: t.surface, opacity: isPast ? 0.55 : 1 }]}
      >
        <Text style={[styles.calNum, isToday ? { backgroundColor: t.brand, color: t.brandInk } : { color: t.ink }]}>{n}</Text>
        {!!perDay[n].length && <Text style={[styles.calCount, { color: t.ink2 }]}>{perDay[n].length}</Text>}
      </Pressable>
    );
  }

  const selDeals = perDay[anchor.getDate()] || [];
  const everyN = selDeals.filter(d => d.sched.t === 'daily').length;
  const recurring = monthDeals.filter(d => d.sched.t === 'monthly' || d.sched.t === 'range');

  return (
    <View>
      <NavHeader title={`${MON_FULL[m]} ${y}`} sub={summary(monthDeals.length, 'this month', filters.city, mine)}
        onPrev={() => { const last = new Date(y, m, 0).getDate(); setAnchor(new Date(y, m - 1, Math.min(anchor.getDate(), last))); }}
        onNext={() => { const last = new Date(y, m + 2, 0).getDate(); setAnchor(new Date(y, m + 1, Math.min(anchor.getDate(), last))); }}
        onToday={() => setAnchor(today)} todayLabel="This month" />

      <View style={styles.calHeadRow}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <Text key={d} style={[styles.calHead, { color: t.muted }]}>{d}</Text>)}
      </View>
      <View style={styles.calGrid}>{cells}</View>

      <View style={{ marginTop: 18 }}>
        <SectionTitle label={fmtLong(anchor)} count={selDeals.length} />
        {everyN > 0 && <Text style={{ color: t.muted, fontSize: 12.5, marginLeft: 16, marginTop: -8, marginBottom: 10 }}>({everyN} every-day)</Text>}
        {selDeals.length ? <List items={selDeals} matchCards={matchCards} /> : <Empty message="No deals on this day." hasActiveFilters={hasActiveFilters} clearFilters={clearFilters} />}
      </View>

      {recurring.length > 0 && (
        <View style={{ marginTop: 20 }}>
          <SectionTitle label="Monthly & limited-period offers" count={recurring.length} />
          <List items={recurring} matchCards={matchCards} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  controls: { paddingTop: 12, paddingBottom: 8, gap: 10 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16 },
  filterBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, height: 44 },
  badge: { width: 18, height: 18, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  sectionTitle: { fontSize: 15, fontWeight: '700', paddingHorizontal: 16, marginBottom: 10 },
  dayCol: { marginHorizontal: 16, marginBottom: 12, borderWidth: 1, borderRadius: 14, padding: 12, gap: 10 },
  dayTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  calHeadRow: { flexDirection: 'row', paddingHorizontal: 16, marginBottom: 6 },
  calHead: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '700' },
  calGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  calCell: { width: '14.28%', aspectRatio: 1, padding: 4, alignItems: 'center', justifyContent: 'center' },
  calDay: { borderWidth: 2, borderRadius: 10, margin: 2 },
  calNum: { fontSize: 13, fontWeight: '700', width: 22, height: 22, borderRadius: 11, textAlign: 'center', textAlignVertical: 'center', overflow: 'hidden' },
  calCount: { fontSize: 10.5, fontWeight: '700', marginTop: 2 },
});
