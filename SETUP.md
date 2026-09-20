# DayJob — going live as a website + app

This repo now serves the DayJob app directly: `public/index.html` (plus
`manifest.json`, `sw.js`, `public/icons/`) is the whole product — a
self-contained PWA that talks to Firebase Auth/Firestore from the browser.
Astro's only job here is to copy that folder into `dist/` for Netlify.
There is no server-side code, so nothing above needs internet access to
build; the steps below (Firebase CLI, Netlify, Capacitor) do need it, and
run on **your own computer**.

## 0. Swap in real icons (optional but recommended)

`public/icons/*.png` are placeholder art (a generated amber bolt mark) so
the PWA/app builds work out of the box. Replace them with real artwork
whenever you have a logo, keeping the same file names and sizes:

- `icon-192.png` (192×192), `icon-512.png` (512×512) — normal icons
- `icon-maskable-192.png`, `icon-maskable-512.png` — same art with extra
  padding so Android can safely crop it into a circle/squircle

## 1. Website — Netlify

This repo is already an Astro + Netlify project.

```bash
npm install
npm run build     # sanity-check locally: builds to ./dist
```

Connect the repo in the Netlify dashboard (New site → Import an existing
project), or run:

```bash
npm install -g netlify-cli
netlify init
netlify deploy --build --prod
```

Build command: `npm run build` · Publish directory: `dist` (Netlify
auto-detects both for Astro projects). You'll get a live URL like
`https://dayjob.netlify.app` — visit it on your phone and you should see a
browser "Install app" / "Add to Home Screen" prompt within a few seconds,
courtesy of the PWA manifest + service worker.

**Custom domain (optional):** Netlify dashboard → Domain management → Add
a domain, then update your domain's DNS as instructed.

**Firebase Auth:** add your Netlify domain (and any custom domain) to
Firebase Console → Authentication → Settings → Authorized domains, or
sign-in will fail on the deployed site.

## 2. Firestore security rules

`firestore.rules` in this repo is the hardened rule set (see the comments
at the top of the file for exactly what it fixes). Deploy it with the
Firebase CLI — this repo is already wired to project `daily-job-c351c` via
`.firebaserc`:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

## 3. Android app (works on Windows/Linux/Mac — no extra hardware needed)

`capacitor.config.json` is set up so the native app is a thin wrapper
around your **live Netlify site** (`server.url`) — the app always shows
whatever's deployed, no separate native bundle to keep in sync. Before
building, edit `capacitor.config.json` and replace
`REPLACE-WITH-YOUR-NETLIFY-DOMAIN.netlify.app` with the real domain from
step 1.

```bash
npm install                # installs @capacitor/core, @capacitor/cli, etc. (already in package.json)
npx cap add android
npx cap sync android
npx cap open android
```

The last command opens **Android Studio** (install it free from
developer.android.com if you don't have it). From there: `Build → Build
Bundle(s)/APK(s)` to test on your phone, or `Build → Generate Signed
Bundle` when you're ready to upload to the Google Play Console (one-time
$25 developer fee).

**Before it'll log in:** add `https://localhost` to Firebase Console →
Authentication → Settings → Authorized domains, since the Android app's
webview origin is `https://localhost` even though it loads your real site.

The generated `android/` project isn't committed (see `.gitignore`) since
it's regenerated from `capacitor.config.json` — remove it from
`.gitignore` if you'd rather commit it for CI builds later.

## 4. iOS app — needs a Mac, but you have two options if you don't have one

- **Borrow/rent one:** any Mac with Xcode installed works — you don't need
  a new one. Cloud options exist too (MacStadium, or a CI service like
  **Codemagic** or **GitHub Actions' macOS runners**, which can build and
  even submit your iOS app without you ever touching a physical Mac).
- **When you do have Mac access:**
  ```bash
  npx cap add ios
  npx cap sync ios
  npx cap open ios
  ```
  This opens Xcode, where you build/test and eventually submit through
  App Store Connect ($99/year Apple Developer Program).

Until then, Android + the installable website cover most users — plenty
of real products launch Android-and-web-first and add iOS a few weeks
later.

## Order of operations, if doing this solo

1. Get the website live (§1) — quick win, testable immediately.
2. Deploy the Firestore rules (§2) so the live site isn't running on
   whatever rules are currently set in the Firebase console.
3. Confirm the "Add to Home Screen" prompt shows up on your own phone.
4. Set up Android (§3), test on your own device via USB debugging.
5. Play Store internal testing track (free, immediate — no review wait)
   to get it on a few phones before public release.
6. iOS whenever Mac access sorts itself out.
