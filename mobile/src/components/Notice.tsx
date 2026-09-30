import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme';
import { DealSource, REAL_DEALS_ASOF } from '../lib/deals';

const MESSAGES: Record<DealSource, string> = {
  real: `Offers collected ${REAL_DEALS_ASOF || 'recently'} from the banks' published card discounts. They change often, so confirm with the merchant before paying.`,
  sample: "Sample data. The database isn't connected, so these are built-in placeholder offers, not live bank deals.",
  fallback: "Couldn't reach the database — showing built-in sample offers instead. Please try again later.",
  db: 'Sample data. The offers shown are illustrative placeholders, not live bank deals. Always confirm with the bank or merchant before paying.',
};

export default function Notice({ source }: { source: DealSource | null }) {
  const t = useTheme();
  if (!source) return null;
  return (
    <View style={[styles.box, { backgroundColor: t.warnSoft, borderColor: t.warn + '40' }]}>
      <Text style={[styles.text, { color: t.warn }]}>{MESSAGES[source]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { marginHorizontal: 16, marginTop: 12, padding: 12, borderRadius: 10, borderWidth: 1 },
  text: { fontSize: 13, lineHeight: 18 },
});
