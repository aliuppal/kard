import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, StyleSheet, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { router, Stack } from 'expo-router';
import { useTheme } from '../src/theme';
import { useApp } from '../src/context/AppContext';
import { BANKS } from '../src/lib/deals';
import { CardType } from '../src/lib/wallet';

const NETWORKS = ['Visa', 'Mastercard', 'UnionPay', 'PayPak', 'Other'];

function Chip({ label, active, onPress, color }: { label: string; active: boolean; onPress: () => void; color?: string }) {
  const t = useTheme();
  return (
    <Pressable onPress={onPress} style={[styles.chip, { borderColor: active ? (color || t.ink) : t.line, backgroundColor: active ? (color || t.ink) : t.surface }]}>
      <Text style={{ color: active ? (color ? '#fff' : t.onInk) : t.ink, fontWeight: '600', fontSize: 13.5 }}>{label}</Text>
    </Pressable>
  );
}

export default function AddCardScreen() {
  const t = useTheme();
  const { addCard } = useApp();
  const [bank, setBank] = useState<string | null>(null);
  const [type, setType] = useState<CardType>('credit');
  const [network, setNetwork] = useState('Visa');
  const [name, setName] = useState('');
  const [last4, setLast4] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!bank) { Alert.alert('Pick a bank', 'Choose which bank issued this card.'); return; }
    setSaving(true);
    try {
      await addCard({ bank, type, network, name: name.trim().slice(0, 30), last4: /^\d{4}$/.test(last4) ? last4 : '' });
      router.back();
    } catch (err: any) {
      Alert.alert('Could not save this card', err?.message || 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: t.bg }]}>
      <Stack.Screen options={{ title: 'Add a card', presentation: 'modal' }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 18 }}>
        <Text style={{ color: t.muted, fontSize: 13 }}>We only need the bank and card type to match offers — don't enter the card number.</Text>

        <View>
          <Text style={[styles.label, { color: t.muted }]}>Bank *</Text>
          <View style={styles.wrap}>
            {BANKS.map(b => <Chip key={b.id} label={b.short} active={bank === b.id} onPress={() => setBank(b.id)} color={bank === b.id ? b.color : undefined} />)}
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: t.muted }]}>Card type *</Text>
          <View style={styles.wrap}>
            <Chip label="Credit" active={type === 'credit'} onPress={() => setType('credit')} />
            <Chip label="Debit" active={type === 'debit'} onPress={() => setType('debit')} />
          </View>
        </View>

        <View>
          <Text style={[styles.label, { color: t.muted }]}>Network</Text>
          <View style={styles.wrap}>
            {NETWORKS.map(n => <Chip key={n} label={n} active={network === n} onPress={() => setNetwork(n)} />)}
          </View>
        </View>

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: t.muted }]}>Card name (optional)</Text>
            <TextInput value={name} onChangeText={setName} maxLength={30} placeholder="e.g. Platinum" placeholderTextColor={t.muted}
              style={[styles.input, { color: t.ink, borderColor: t.line, backgroundColor: t.surface }]} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: t.muted }]}>Last 4 digits (optional)</Text>
            <TextInput value={last4} onChangeText={v => setLast4(v.replace(/\D/g, '').slice(0, 4))} keyboardType="number-pad" maxLength={4}
              placeholder="1234" placeholderTextColor={t.muted} style={[styles.input, { color: t.ink, borderColor: t.line, backgroundColor: t.surface }]} />
          </View>
        </View>

        <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
          <Pressable onPress={() => router.back()} style={[styles.btn, { flex: 1, borderColor: t.line, borderWidth: 1 }]}>
            <Text style={{ color: t.ink, fontWeight: '600' }}>Cancel</Text>
          </Pressable>
          <Pressable onPress={save} disabled={saving} style={[styles.btn, { flex: 1, backgroundColor: t.brand, opacity: saving ? 0.7 : 1 }]}>
            {saving ? <ActivityIndicator color={t.brandInk} /> : <Text style={{ color: t.brandInk, fontWeight: '700' }}>Save card</Text>}
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.3 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 12 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  btn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
});
