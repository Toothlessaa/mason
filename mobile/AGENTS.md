# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v57.0.0/ before writing any code.

## Local verification (SDK 57, Node 24)

- Typecheck: `node --stack-size=8000 node_modules/typescript/bin/tsc --noEmit` (Node 24 crashes without the stack-size bump)
- JS bundle check: `$env:CI="1"; npx expo export --platform android`

## Build pipeline

- No EAS daemon / no Expo Go: the release APK is built by the manual GitHub Action `.github/workflows/android-release.yml` (Actions → Android Release Build → Run workflow), which runs `npx expo prebuild` on the runner. Prebuild regenerates `mobile/android/` locally too, so never edit files there.
- Signing: keystore is `masonic-upload.keystore` + `android-signing.env` at repo root (both gitignored); secrets needed in GitHub: `ANDROID_KEYSTORE_B64`, `ANDROID_STORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, `EXPO_PUBLIC_API_URL`, `EXPO_PUBLIC_EXPO_PROJECT_ID`, and `GOOGLE_SERVICES_JSON_B64`.
- Icons: regenerate with `node scripts/generate-icons.mjs` (uses sharp; source `logo1.jpg` at repo root).
- Push: Expo push tokens are stored in `members.push_token` (schema in `supabase-schema.sql`); notifications are sent through the Vercel `/api/send-push` endpoint.
- Mobile release builds require `EXPO_PUBLIC_EXPO_PROJECT_ID` and `EXPO_PUBLIC_API_URL` in their environment. `EXPO_PUBLIC_API_URL` must be the deployed Vercel origin, for example `https://your-app.vercel.app`.
