import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { CATEGORIES } from '../lib/deals';
import { useApp } from '../context/AppContext';

export default function CategoryChips() {
  const t = useTheme();
  const { filters, setFilters } = useApp();
  const items = [{ id: 'all', name: 'All', icon: '✨' }, ...CATEGORIES];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map(c => {
        const active = filters.cat === c.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => setFilters({ cat: c.id })}
            style={[styles.chip, { borderColor: active ? t.brand : t.line, backgroundColor: active ? t.brand : t.surface }]}
          >
            <Text style={{ color: active ? t.brandInk : t.ink, fontWeight: '600', fontSize: 13.5 }}>{c.icon} {c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 8, paddingVertical: 4 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
});
