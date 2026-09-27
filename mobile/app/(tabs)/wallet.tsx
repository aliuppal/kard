import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useApp } from '../../src/context/AppContext';
import CardTile from '../../src/components/CardTile';

export default function WalletScreen() {
  const t = useTheme();
  const { cards, cardsLoading, removeCard, addDemoCards, session } = useApp();

  const confirmRemove = (id: string | number, label: string) => {
    Alert.alert('Remove card', `Remove your ${label}?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeCard(id) },
    ]);
  };

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <View style={styles.headRow}>
          <Text style={[styles.h1, { color: t.ink }]}>My cards</Text>
          <Text style={[styles.sync, { color: t.muted }]}>{session ? '☁ Synced to your account' : 'Saved on this device only'}</Text>
        </View>

        {cardsLoading ? (
          <ActivityIndicator color={t.brand} style={{ marginTop: 30 }} />
        ) : !cards.length ? (
          <View style={[styles.empty, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Text style={{ color: t.muted, textAlign: 'center', marginBottom: 14 }}>
              Add your debit and credit cards to see only the deals you can actually use.
              {!session ? ' Sign in with Google on the Profile tab to sync them across devices.' : ''}
            </Text>
            <Pressable onPress={() => router.push('/add-card')} style={[styles.btn, styles.primary, { backgroundColor: t.brand }]}>
              <Text style={{ color: t.brandInk, fontWeight: '700' }}>＋ Add a card</Text>
            </Pressable>
            <Pressable onPress={addDemoCards} style={[styles.btn, { borderColor: t.line, borderWidth: 1, marginTop: 8 }]}>
              <Text style={{ color: t.ink, fontWeight: '600' }}>Try with sample cards</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <View style={{ gap: 12 }}>
              {cards.map(c => <CardTile key={c.id} card={c} onRemove={() => confirmRemove(c.id, `${c.bank.toUpperCase()} card`)} />)}
            </View>
            <Pressable onPress={() => router.push('/add-card')} style={[styles.btn, styles.primary, { backgroundColor: t.brand, marginTop: 16 }]}>
              <Text style={{ color: t.brandInk, fontWeight: '700' }}>＋ Add another card</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headRow: { marginBottom: 16 },
  h1: { fontSize: 22, fontWeight: '800' },
  sync: { fontSize: 12.5, marginTop: 2 },
  empty: { borderWidth: 1, borderRadius: 14, padding: 18 },
  btn: { paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  primary: {},
});
