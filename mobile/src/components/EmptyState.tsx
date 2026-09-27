import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme, radius } from '../theme';

export default function EmptyState({ message, actionLabel, onAction }: { message: string; actionLabel?: string; onAction?: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.box, { backgroundColor: t.surface, borderColor: t.line }]}>
      <Text style={[styles.text, { color: t.muted }]}>{message}</Text>
      {!!actionLabel && !!onAction && (
        <Pressable onPress={onAction} style={[styles.btn, { borderColor: t.line }]}>
          <Text style={{ color: t.ink, fontWeight: '600' }}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  box: { alignItems: 'center', gap: 12, padding: 28, borderRadius: radius, borderWidth: 1, borderStyle: 'dashed', marginHorizontal: 16 },
  text: { textAlign: 'center', fontSize: 14 },
  btn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
});
