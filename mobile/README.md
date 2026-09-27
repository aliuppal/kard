# Kard (mobile)

The Kard app for iOS and Android — Expo / React Native, sharing the same Supabase backend as the web app in `../`. Browse deals daily/weekly/monthly, filter by city and category, keep a card wallet, and sign in with Google to sync that wallet across devices.

> Admin (adding/editing/deleting deals) is web-only — see `../admin.html`. This app is for browsing deals and managing your own wallet, not for managing the catalog.

## Set up

1. **Supabase.** Follow `../README.md` first — run `../supabase/schema.sql`, and have your Project URL + anon key ready.
2. **Google sign-in (optional but recommended).** See below. Skip it for now and the app still works — deals browsing and an on-device wallet work with no account at all; only cross-device sync needs Google.
3. Copy the env file and fill it in:
   ```
   cd mobile
   cp .env.example .env
   ```
4. Install and run:
   ```
   npm install
   npx expo start
   ```
   Scan the QR code with **Expo Go** (iOS/Android) to run it on your phone, or press `a` / `i` for an emulator/simulator.

Whenever you change `../catalog.js` or `../sample-deals.js`, regenerate the mobile copy from the repo root:
```
node scripts/export-mobile-data.js
```

## Google sign-in setup

Native Google sign-in needs **three** OAuth client IDs from one Google Cloud project (Supabase's recommended setup for Expo/React Native — it gets an ID token straight from Google and hands it to Supabase, no browser redirect involved).

1. **Google Cloud Console** → APIs & Services → **OAuth consent screen** → configure it (External is fine for testing).
2. **Credentials** → **Create OAuth client ID**, three times:
   - **Web application** → note the Client ID. This is `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, and it also gets used as Supabase's Google provider Client ID (next step).
   - **iOS** → Bundle ID `com.kard.app` (matches `app.json`) → `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`.
   - **Android** → Package name `com.kard.app` → SHA-1 certificate fingerprint (get it with `eas credentials`, once you've set up an EAS project — the Expo Go debug fingerprint won't match a real build) → `EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID`.
3. **Supabase → Authentication → Sign In / Providers → Google**: paste the **Web** client's Client ID and Client Secret. If there's an "Authorized Client IDs" field, add the iOS and Android client IDs there too, so Supabase accepts tokens minted for any of the three.
4. Put all three IDs in `mobile/.env`, restart `expo start`.

**Testing in Expo Go:** Google's native sign-in SDK isn't available inside Expo Go, so it falls back to a browser-based flow using the Web client ID. If it doesn't redirect back cleanly, add Expo's proxy URL (`https://auth.expo.io/@your-expo-username/kard`) as an Authorized redirect URI on the Web OAuth client — or, more reliably, build a [development build](https://docs.expo.dev/develop/development-builds/introduction/) (`npx expo run:android` / `npx expo run:ios`, or an EAS dev build) and test there instead, which behaves exactly like the real app.

## Building a real app (APK / IPA / store submission)

This environment has no Android SDK or Xcode, so builds run on Expo's cloud service, [EAS Build](https://docs.expo.dev/build/introduction/) — free tier available, needs an Expo account:
```
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android   # or ios, or --platform all
```
That produces an installable `.apk`/`.aab` (Android) or needs an Apple Developer account for iOS. Submitting to the Play Store / App Store (`eas submit`) is a separate, deliberate step — it costs money (Apple) and puts the app in front of real users, so don't run it without deciding that's what you want first.

## What's implemented

- **Deals** — Daily / Weekly / Monthly, same schedule logic as the web app (`src/lib/deals.ts`, `src/lib/filterDeals.ts`), with city, category, bank, card-type, search and sort filters.
- **Wallet** — add/remove cards. Signed out: stored on-device (AsyncStorage). Signed in: synced to Supabase's `user_cards` table, so it matches the web app.
- **Google sign-in** — via `expo-auth-session`, handing Google's ID token to Supabase's `signInWithIdToken`.
- **Profile** — name/avatar from Google, editable home city (`profiles` table).
- Falls back to the bundled sample deals if Supabase isn't configured or is unreachable, same as the web app.

## Project layout

```
app/                 expo-router screens ((tabs)/index = Deals, wallet, profile, add-card modal)
src/lib/              supabase client, deals loading + schedule matching, wallet storage, Google auth
src/context/           AppContext — the shared app state every screen reads from
src/components/        DealCard, FiltersModal, CardTile, etc.
src/data/               catalog.json + sampleDeals.json, generated — don't hand-edit, see above
```
