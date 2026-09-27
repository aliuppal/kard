// Supabase client for the mobile app. Session tokens are cached with
// AsyncStorage so a sign-in survives app restarts.
import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

// True once real Supabase credentials are in mobile/.env (see .env.example).
export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

// createClient() throws on an empty URL, so fall back to a harmless
// placeholder when unconfigured — every call site checks isSupabaseConfigured
// (or the `deals` load's own try/catch) before relying on real data.
// `web` builds go through a Node SSR pass first (no `window`/WebSocket there)
// — only touch on-device storage and auto-refresh once running in a real
// browser or the native app. iOS/Android are unaffected either way.
const isBrowserOrNative = typeof document !== 'undefined' || typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: isBrowserOrNative,
      persistSession: isBrowserOrNative,
      detectSessionInUrl: false,
    },
  }
);
