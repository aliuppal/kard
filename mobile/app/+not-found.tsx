import { Link, Stack } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../src/theme';

export default function NotFoundScreen() {
  const t = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: t.bg }]}>
        <Text style={[styles.title, { color: t.ink }]}>This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text style={[styles.linkText, { color: t.brand }]}>Go to the deals screen</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: '700' },
  link: { marginTop: 15, paddingVertical: 15 },
  linkText: { fontSize: 14, fontWeight: '600' },
});
