import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { radius } from '../theme';
import { BANK_BY_ID } from '../lib/deals';
import { Card } from '../lib/wallet';

export default function CardTile({ card, onRemove }: { card: Card; onRemove: () => void }) {
  const bank = BANK_BY_ID[card.bank];
  if (!bank) return null;
  return (
    <View style={[styles.card, { backgroundColor: bank.color }]}>
      <Pressable onPress={onRemove} style={styles.x} accessibilityLabel={`Remove ${bank.name} card`} hitSlop={8}>
        <Text style={styles.xText}>×</Text>
      </Pressable>
      <Text style={styles.bankName}>{bank.name}</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>{card.type === 'credit' ? 'Credit' : 'Debit'} · {card.network}</Text>
        {!!card.last4 && <Text style={styles.meta}>•••• {card.last4}</Text>}
      </View>
      {!!card.name && <Text style={styles.meta}>{card.name}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius, padding: 16, minHeight: 108, justifyContent: 'space-between', gap: 12 },
  x: { position: 'absolute', top: 8, right: 8, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.28)', alignItems: 'center', justifyContent: 'center' },
  xText: { color: '#fff', fontSize: 16, lineHeight: 18 },
  bankName: { color: '#fff', fontSize: 16, fontWeight: '800' },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between' },
  meta: { color: 'rgba(255,255,255,0.9)', fontSize: 12.5 },
});
