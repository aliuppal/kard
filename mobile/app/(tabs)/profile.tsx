import React, { useState } from 'react';
import { View, Text, Image, ScrollView, Pressable, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useTheme } from '../../src/theme';
import { useApp, CITIES } from '../../src/context/AppContext';
import { useGoogleSignIn } from '../../src/lib/googleAuth';
import { isSupabaseConfigured } from '../../src/lib/supabase';

function GoogleG() {
  // Inline "G" mark using colored letters — avoids bundling an SVG lib for one icon.
  return <Text style={{ fontWeight: '800' }}><Text style={{ color: '#4285F4' }}>G</Text></Text>;
}

export default function ProfileScreen() {
  const t = useTheme();
  const { session, profile, authReady, signOut, setProfileCity } = useApp();
  const google = useGoogleSignIn();
  const [savingCity, setSavingCity] = useState<string | null>(null);

  if (!isSupabaseConfigured) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[styles.h1, { color: t.ink }]}>Profile</Text>
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, marginTop: 16 }]}>
            <Text style={{ color: t.muted }}>
              The app isn't connected to a database yet, so accounts aren't available. You can still browse deals and keep cards on this device.
            </Text>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!authReady) {
    return <View style={[styles.root, styles.center, { backgroundColor: t.bg }]}><ActivityIndicator color={t.brand} /></View>;
  }

  if (!session) {
    return (
      <View style={[styles.root, { backgroundColor: t.bg }]}>
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <Text style={[styles.h1, { color: t.ink }]}>Profile</Text>
          <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, marginTop: 16 }]}>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15, marginBottom: 6 }}>Sign in to sync your cards</Text>
            <Text style={{ color: t.muted, marginBottom: 16 }}>
              Sign in with Google to save your wallet to your account — it'll show up on the web app and any other device too.
            </Text>
            {!google.configured ? (
              <Text style={{ color: t.warn, fontSize: 13 }}>
                Google sign-in isn't configured yet. Add the Google client IDs to mobile/.env (see README.md).
              </Text>
            ) : (
              <Pressable
                onPress={google.signIn}
                disabled={!google.ready || google.signingIn}
                style={[styles.btn, { backgroundColor: '#fff', borderColor: t.line, borderWidth: 1, opacity: !google.ready || google.signingIn ? 0.6 : 1 }]}
              >
                {google.signingIn ? <ActivityIndicator color="#4285F4" /> : (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <GoogleG />
                    <Text style={{ color: '#1f1f1f', fontWeight: '700' }}>Continue with Google</Text>
                  </View>
                )}
              </Pressable>
            )}
            {!!google.error && <Text style={{ color: t.danger, marginTop: 10, fontSize: 13 }}>{google.error}</Text>}
          </View>
        </ScrollView>
      </View>
    );
  }

  const name = profile?.full_name || session.user.user_metadata?.full_name || session.user.email;
  const avatar = profile?.avatar_url || session.user.user_metadata?.avatar_url;

  return (
    <View style={[styles.root, { backgroundColor: t.bg }]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={[styles.h1, { color: t.ink }]}>Profile</Text>

        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, marginTop: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }]}>
          {avatar ? <Image source={{ uri: avatar }} style={styles.avatar} /> : (
            <View style={[styles.avatar, { backgroundColor: t.brandSoft, alignItems: 'center', justifyContent: 'center' }]}>
              <Text style={{ color: t.brand, fontWeight: '800', fontSize: 18 }}>{(name || '?').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={{ color: t.ink, fontWeight: '700', fontSize: 15 }} numberOfLines={1}>{name}</Text>
            <Text style={{ color: t.muted, fontSize: 12.5 }} numberOfLines={1}>{session.user.email}</Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: t.surface, borderColor: t.line, marginTop: 12 }]}>
          <Text style={{ color: t.ink, fontWeight: '700', marginBottom: 10 }}>Home city</Text>
          <View style={styles.wrap}>
            {CITIES.map(c => {
              const active = profile?.city === c;
              return (
                <Pressable
                  key={c}
                  disabled={savingCity !== null}
                  onPress={async () => { setSavingCity(c); await setProfileCity(c); setSavingCity(null); }}
                  style={[styles.chip, { borderColor: active ? t.ink : t.line, backgroundColor: active ? t.ink : 'transparent' }]}
                >
                  <Text style={{ color: active ? t.onInk : t.ink, fontWeight: '600', fontSize: 13 }}>{c}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => Alert.alert('Sign out', 'Sign out of Kard?', [{ text: 'Cancel', style: 'cancel' }, { text: 'Sign out', style: 'destructive', onPress: signOut }])}
          style={[styles.btn, { borderColor: t.line, borderWidth: 1, marginTop: 16 }]}
        >
          <Text style={{ color: t.danger, fontWeight: '700' }}>Sign out</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  h1: { fontSize: 22, fontWeight: '800' },
  card: { borderWidth: 1, borderRadius: 14, padding: 16 },
  btn: { paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, borderWidth: 1 },
});
