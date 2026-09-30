import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BANK_BY_ID } from '../lib/deals';
import { Card } from '../lib/wallet';

// A physical-card look without a gradient dependency: bank color base, a soft
// light sheen top-right and a darker wash bottom-left, plus an EMV chip.
export default function CardTile({ card, onRemove }: { card: Card; onRemove: () => void }) {
  const bank = BANK_BY_ID[card.bank];
  if (!bank) return null;
  return (
    <View style={[styles.card, { backgroundColor: bank.color, shadowColor: bank.color }]}>
      <View style={styles.sheen} pointerEvents="none" />
      <View style={styles.shade} pointerEvents="none" />
      <Pressable onPress={onRemove} style={styles.x} accessibilityLabel={`Remove ${bank.name} card`} hitSlop={8}>
        <MaterialCommunityIcons name="close" size={14} color="#fff" />
      </Pressable>
      <View style={styles.topRow}>
        <Text style={styles.bankName}>{bank.name}</Text>
        <Text style={styles.type}>{card.type === 'credit' ? 'CREDIT' : 'DEBIT'}</Text>
      </View>
      <View style={styles.chipRow}>
        <View style={styles.chip}><View style={styles.chipInner} /></View>
        {!!card.name && <Text style={styles.nick}>{card.name}</Text>}
      </View>
      <View style={styles.metaRow}>
        <Text style={styles.num}>{card.last4 ? `•••• ${card.last4}` : ''}</Text>
        <Text style={styles.net}>{card.network}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18, padding: 18, aspectRatio: 1.586, justifyContent: 'space-between', overflow: 'hidden',
    shadowOpacity: 0.35, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 5,
  },
  sheen: { position: 'absolute', top: -80, right: -60, width: 220, height: 220, borderRadius: 110, backgroundColor: 'rgba(255,255,255,0.14)' },
  shade: { position: 'absolute', bottom: -90, left: -50, width: 240, height: 200, borderRadius: 120, backgroundColor: 'rgba(0,0,0,0.22)' },
  x: { position: 'absolute', top: 12, right: 12, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center', zIndex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingRight: 34, gap: 8 },
  bankName: { color: '#fff', fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  type: { color: 'rgba(255,255,255,0.85)', fontSize: 10.5, fontWeight: '700', letterSpacing: 1, paddingTop: 4 },
  chipRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chip: { width: 38, height: 28, borderRadius: 6, backgroundColor: '#d9bd72', borderWidth: 1, borderColor: 'rgba(0,0,0,0.15)', padding: 7 },
  chipInner: { flex: 1, borderRadius: 3, borderWidth: 1, borderColor: 'rgba(90,60,10,0.35)' },
  nick: { color: 'rgba(255,255,255,0.85)', fontSize: 12.5 },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  num: { color: 'rgba(255,255,255,0.95)', fontSize: 14, letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  net: { color: '#fff', fontSize: 15, fontWeight: '800', fontStyle: 'italic' },
});
