# Freelancing 24x7 — Android app, email system & deployment guide

## 1. What changed
| Area | Summary |
|---|---|
| Android | Capacitor project in `ui/android` (app id `com.freelancing24x7.app`, minSdk 24). Web assets are bundled in the APK; it talks to your deployed API over HTTPS. |
| Backend | New `config/`, `services/`, `templates/`; typed HTML emails, delivery log, admin switches, per-user opt-outs, rate limits, CORS allow-list, helmet. |
| Security fixes | Public `/register` can no longer create admins (use `npm run create-admin`). Accept/reject bid now verifies the project belongs to the caller. |
| App UI | Android back button, status bar, splash, bottom tab bar, notifications screen, API loading bar, admin **Email** page, email preference switches on profiles. |

## 2. Get the APK (no Android Studio needed)
1. Copy these files into your GitHub repo (same paths) and push to `main`.
2. In GitHub: **Settings → Secrets and variables → Actions → Variables → New variable** `API_URL` = your backend's `https://…` address.
3. **Actions → Build Android APK → Run workflow**. When it finishes, download **freelancing24x7-debug-apk** from *Artifacts*, unzip, you have `app-debug.apk`.
4. If the build fails, open the failed step's log and send it to me — I have not been able to run Gradle myself, so first-run fixes are possible.

### Build locally instead
Requirements: Node 22, JDK 21, Android Studio (SDK 36).
```bash
cd ui
npm ci
VITE_API_URL=https://YOUR-API.onrender.com npm run build:android
cd android && ./gradlew assembleDebug
# APK: ui/android/app/build/outputs/apk/debug/app-debug.apk
```
Or `npm run android:open` and press Run in Android Studio.

### Signed release APK
```bash
keytool -genkeypair -v -keystore release.jks -alias freelancing24x7 -keyalg RSA -keysize 2048 -validity 10000
```
Keep `release.jks` and its passwords safe and OUT of git (losing it means you can't update the app).
- **CI:** add secrets `ANDROID_KEYSTORE_BASE64` (`base64 -w0 release.jks`), `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`; the workflow then also uploads a signed release APK.
- **Local:** export `ANDROID_KEYSTORE_FILE`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, then `./gradlew assembleRelease`.

## 3. Install and test on a phone
1. Phone: Settings → About → tap *Build number* 7 times → Developer options → enable **USB debugging**.
2. Copy `app-debug.apk` to the phone and open it (allow "install unknown apps"), **or** with a USB cable: `adb install -r app-debug.apk`.
3. Live logs: `adb logcat | grep -i chromium` — in Chrome on a PC open `chrome://inspect` to inspect the app's WebView.

## 4. Environment variables
**Backend (`api/.env` locally; Render → Environment in production)** — see `api/.env.example`.
Required: `MONGO_URI`, `JWT_SECRET` (long random), `FRONTEND_URL`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `ADMIN_EMAIL`.
Gmail: enable 2-step verification, create an **App Password**, use `smtp.gmail.com`, port `587`, `SMTP_SECURE=false`.
SMTP credentials exist only on the server — never in `ui/` or the APK.

**Frontend:** only `VITE_API_URL` (public address of the API). Must be `https://` for the Android build.

## 5. Deploy the backend (Render)
1. Web Service → root directory `api`, build `npm install`, start `npm start`.
2. Add the environment variables above. Set `FRONTEND_URL` to your website address (this also switches CORS from "open" to an allow-list; the Android app origin is always allowed).
3. Create your admin: Render Shell → `npm run create-admin -- "Name" you@example.com 'LongPassword'`. Existing data/accounts are never modified.
4. Check `https://YOUR-API/health` returns `{"ok":true}`.
5. Verify email for real: sign in as admin → **Email** page → *Send test email to me*.

## 6. Tests
`api/tests/integration.mjs` (73 checks) runs the real API against a **test** database and a local SMTP capture server (`tests/smtp-sink.mjs`). Instructions are at the top of the file. It refuses to run unless the database name contains "test".

## 7. Known gaps / not done
- APK build and on-device testing: **not yet run by me** (no Android SDK in my environment). Use the workflow above.
- Gmail delivery: untested by me; only a local SMTP server was used. Use the admin test button.
- "Verified recipients": accounts have no email-verification step, so emails go to active, non-blocked, non-deleted accounts with valid addresses.
- Refresh tokens: not present in your architecture; JWT lifetime stays 7 days.
- Project "details" page does not exist; emails link to the freelancer project list.
- Login alert emails existed before; they stay on (admin or user can switch them off).
- Existing lint warnings in untouched pages remain; `npm run lint` reports the React-19 "setState in effect" rule on the fetch-on-mount pattern used across the project.
- Render free tier sleeps: first request after idle can take ~30–60 s; the app shows the loading bar meanwhile.
