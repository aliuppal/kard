import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../theme';
import { CATEGORIES } from '../lib/deals';
import { categoryIcon } from '../lib/categoryIcons';
import { useApp } from '../context/AppContext';

export default function CategoryChips() {
  const t = useTheme();
  const { filters, setFilters } = useApp();
  const items = [{ id: 'all', name: 'All' }, ...CATEGORIES];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
      {items.map(c => {
        const active = filters.cat === c.id;
        return (
          <Pressable
            key={c.id}
            onPress={() => setFilters({ cat: c.id })}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.chip,
              { borderColor: active ? t.ink : t.line, backgroundColor: active ? t.ink : t.surface, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <MaterialCommunityIcons name={categoryIcon(c.id)} size={15} color={active ? t.onInk : t.muted} />
            <Text style={{ color: active ? t.onInk : t.ink2, fontWeight: '500', fontSize: 13.5 }}>{c.name}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { paddingHorizontal: 16, gap: 6, paddingVertical: 4 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingLeft: 10, paddingRight: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
});
