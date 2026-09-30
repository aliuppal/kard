import React from 'react';
import { Modal, View, Text, TextInput, Pressable, ScrollView, StyleSheet, Switch, SafeAreaView } from 'react-native';
import { useTheme } from '../theme';
import { useApp, CITIES } from '../context/AppContext';
import { BANKS } from '../lib/deals';

const SORTS: { value: 'best' | 'ending' | 'az'; label: string }[] = [
  { value: 'best', label: 'Biggest discount' },
  { value: 'ending', label: 'Ending soonest' },
  { value: 'az', label: 'Merchant A–Z' },
];
const TYPES: { value: 'all' | 'credit' | 'debit'; label: string }[] = [
  { value: 'all', label: 'Credit & debit' },
  { value: 'credit', label: 'Credit only' },
  { value: 'debit', label: 'Debit only' },
];

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, { borderColor: active ? t.ink : t.line, backgroundColor: active ? t.ink : t.surface }]}
    >
      <Text style={{ color: active ? t.onInk : t.ink, fontWeight: '600', fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: t.muted }]}>{title}</Text>
      {children}
    </View>
  );
}

export default function FiltersModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { filters, setFilters, clearFilters, cards } = useApp();

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: t.ink }]}>Filters</Text>
          <Pressable onPress={onClose}><Text style={{ color: t.brand, fontWeight: '700', fontSize: 15 }}>Done</Text></Pressable>
        </View>
        <ScrollView contentContainerStyle={{ padding: 16, gap: 4 }}>
          <Section title="Search">
            <TextInput
              value={filters.q}
              onChangeText={q => setFilters({ q })}
              placeholder="Merchant, e.g. Khaadi"
              placeholderTextColor={t.muted}
              style={[styles.input, { color: t.ink, borderColor: t.line, backgroundColor: t.surface }]}
            />
          </Section>

          <Section title="Sort by">
            <View style={styles.wrap}>
              {SORTS.map(s => <Chip key={s.value} label={s.label} active={filters.sort === s.value} onPress={() => setFilters({ sort: s.value })} />)}
            </View>
          </Section>

          <Section title="Card type">
            <View style={styles.wrap}>
              {TYPES.map(s => <Chip key={s.value} label={s.label} active={filters.type === s.value} onPress={() => setFilters({ type: s.value })} />)}
            </View>
          </Section>

          <Section title="City">
            <View style={styles.wrap}>
              <Chip label="All cities" active={filters.city === 'all'} onPress={() => setFilters({ city: 'all' })} />
              {CITIES.map(c => <Chip key={c} label={c} active={filters.city === c} onPress={() => setFilters({ city: c })} />)}
            </View>
          </Section>

          <Section title="Bank">
            <View style={styles.wrap}>
              <Chip label="All banks" active={filters.bank === 'all'} onPress={() => setFilters({ bank: 'all' })} />
              {BANKS.map(b => <Chip key={b.id} label={b.short} active={filters.bank === b.id} onPress={() => setFilters({ bank: b.id })} />)}
            </View>
          </Section>

          <View style={[styles.row, { borderColor: t.line, opacity: cards.length ? 1 : 0.55 }]}>
            <Text style={{ color: t.ink, fontWeight: '600', flex: 1 }}>
              Only deals for my cards{!cards.length ? ' (add a card first)' : ''}
            </Text>
            <Switch value={filters.mine} onValueChange={mine => setFilters({ mine })} disabled={!cards.length}
              trackColor={{ true: t.ink }} />
          </View>

          <Pressable onPress={clearFilters} style={styles.clear}>
            <Text style={{ color: t.muted, fontWeight: '600' }}>Clear all filters</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  title: { fontSize: 18, fontWeight: '800' },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3, marginBottom: 8 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, borderTopWidth: 1, marginTop: 4 },
  clear: { alignItems: 'center', paddingVertical: 16 },
});
