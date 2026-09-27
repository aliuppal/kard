// Google sign-in for the mobile app, via Expo AuthSession's Google provider.
// This gets an ID token straight from Google, which is handed to Supabase's
// signInWithIdToken — the pattern Supabase recommends for native apps (no
// browser-redirect dance, and it works the same in Expo Go and a real build).
//
// Needs three Google Cloud OAuth client IDs (Web, iOS, Android) in .env —
// see ../../README.md. Until they're set, `configured` is false and the
// sign-in button explains that instead of crashing.
import { useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '';
const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '';
const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '';

export const isGoogleConfigured = Boolean(webClientId);

export function useGoogleSignIn() {
  const [error, setError] = useState<string | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId: webClientId || undefined,
    iosClientId: iosClientId || undefined,
    androidClientId: androidClientId || undefined,
  });

  useEffect(() => {
    if (!response) return;
    if (response.type === 'error') {
      setError(response.error?.message || 'Google sign-in failed.');
      return;
    }
    if (response.type !== 'success') return;

    const idToken = (response.authentication as any)?.idToken ?? (response.params as any)?.id_token;
    if (!idToken) {
      setError('Google did not return an ID token.');
      return;
    }
    setSigningIn(true);
    supabase.auth
      .signInWithIdToken({ provider: 'google', token: idToken })
      .then(({ error: sbError }) => {
        if (sbError) setError(sbError.message);
      })
      .finally(() => setSigningIn(false));
  }, [response]);

  return {
    configured: isGoogleConfigured,
    ready: !!request,
    signingIn,
    error,
    signIn: () => {
      setError(null);
      promptAsync();
    },
  };
}
