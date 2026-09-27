import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

export default function NavHeader({ title, sub, onPrev, onNext, onToday, todayLabel }: {
  title: string; sub: string; onPrev: () => void; onNext: () => void; onToday: () => void; todayLabel: string;
}) {
  const t = useTheme();
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.title, { color: t.ink }]}>{title}</Text>
        <Text style={[styles.sub, { color: t.muted }]}>{sub}</Text>
      </View>
      <View style={styles.nav}>
        <Pressable onPress={onPrev} style={[styles.btn, { borderColor: t.line }]}><Text style={{ color: t.ink, fontSize: 16 }}>‹</Text></Pressable>
        <Pressable onPress={onToday} style={[styles.btn, { borderColor: t.line }]}><Text style={{ color: t.ink, fontWeight: '600', fontSize: 13 }}>{todayLabel}</Text></Pressable>
        <Pressable onPress={onNext} style={[styles.btn, { borderColor: t.line }]}><Text style={{ color: t.ink, fontSize: 16 }}>›</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, marginTop: 14, marginBottom: 10 },
  title: { fontSize: 18, fontWeight: '800' },
  sub: { fontSize: 12.5, marginTop: 2 },
  nav: { flexDirection: 'row', gap: 6 },
  btn: { borderWidth: 1, borderRadius: 9, paddingHorizontal: 10, paddingVertical: 6 },
});
