# DayJob — going live as a website + app

This repo now serves the DayJob app directly: `public/index.html` (plus
`manifest.json`, `sw.js`, `public/icons/`) is the whole product — a
self-contained PWA that talks to Firebase Auth/Firestore from the browser.
Astro's only job here is to copy that folder into `dist/` for Netlify.
There is no server-side code, so nothing above needs internet access to
build; the steps below (Firebase CLI, Netlify, domain registrar, Capacitor)
do need it, and run on **your own computer**, with your own accounts.

Nobody but you can complete steps 1–4 — they need your Netlify/Firebase
logins and your money (domain + app store fees). This doc is the full
checklist, in the order to do them.

## 0. Swap in real icons and fill in placeholders (do this first)

`public/icons/*.png` are placeholder art (a generated amber bolt mark) so
the PWA/app builds work out of the box. Replace them with real artwork
whenever you have a logo, keeping the same file names and sizes:

- `icon-192.png` (192×192), `icon-512.png` (512×512) — normal icons
- `icon-maskable-192.png`, `icon-maskable-512.png` — same art with extra
  padding so Android can safely crop it into a circle/squircle

Also fill in these placeholders (search the repo for them):

| File | Placeholder | What to put there |
| :--- | :--- | :--- |
| `public/privacy.html`, `public/terms.html` | `[VENDOS-EMAILIN-TËND-KËTU]`, `[PLOTËSO DATËN...]` | A real support email and today's date |
| `public/sitemap.xml` | `REPLACE-WITH-YOUR-DOMAIN.com` | Your domain, once bought (§2) |
| `capacitor.config.json` | `REPLACE-WITH-YOUR-NETLIFY-DOMAIN.netlify.app` | Your live site URL (§1 or §2) |

`public/privacy.html` and `public/terms.html` are a reasonable starting
point, **not legal advice** — have a lawyer review them before you rely on
them, especially the employment/payments sections. The Terms page
deliberately calls out that in-app "wallet" payouts are demo-only right
now (see `firestore.rules`'s comments) — keep that disclosure until real
payments actually ship.

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

Build command: `npm run build` · Publish directory: `dist` (already set in
`netlify.toml`, which also pins caching so `sw.js`/`manifest.json` never go
stale in a browser cache and blocks framing/clickjacking on every page).
You'll get a live URL like `https://dayjob.netlify.app` — visit it on your
phone and you should see a browser "Install app" / "Add to Home Screen"
prompt within a few seconds, courtesy of the PWA manifest + service worker.

**Firebase Auth:** add that Netlify domain to Firebase Console →
Authentication → Settings → Authorized domains, or sign-in will fail on
the deployed site.

## 2. Buy a domain and connect it

You don't need Netlify to buy the domain — any registrar works. Cheap,
reliable ones: **Namecheap**, **Porkbun**, **Cloudflare Registrar** (sells
at cost, no markup), or **Netlify Domains** itself (buy directly from the
Netlify dashboard, which auto-connects — the least setup if you want the
simplest path).

1. Buy the domain from whichever registrar you prefer (expect ~$10–15/yr
   for a `.com`, `.al` domains run higher through Albanian registrars).
2. In Netlify: **Site settings → Domain management → Add a domain** →
   enter your domain.
3. If you bought it somewhere other than Netlify, Netlify shows you either
   nameservers to switch to (easiest — Netlify manages all DNS) or the
   A/CNAME records to add at your existing registrar. Either way, Netlify
   walks you through it and auto-provisions a free SSL certificate (Let's
   Encrypt) once DNS resolves — usually within minutes to a few hours.
4. Add the **new custom domain** to Firebase Console → Authentication →
   Settings → Authorized domains (in addition to the `.netlify.app` one).
5. Update the placeholders in `public/sitemap.xml` and
   `capacitor.config.json` (§0 table above) to the real domain, commit,
   and redeploy.

## 3. Firestore security rules

`firestore.rules` in this repo is the hardened rule set (see the comments
at the top of the file for exactly what it fixes). Deploy it with the
Firebase CLI — this repo is already wired to project `daily-job-c351c` via
`.firebaserc`:

```bash
npm install -g firebase-tools
firebase login
firebase deploy --only firestore:rules
```

Do this **before** driving real traffic to the site — the live app should
never run on whatever rules happen to be set in the Firebase console.

## 4. Android app (works on Windows/Linux/Mac — no extra hardware needed)

`capacitor.config.json` is set up so the native app is a thin wrapper
around your **live site** (`server.url`) — the app always shows whatever's
deployed, no separate native bundle to keep in sync. Make sure you've
replaced the placeholder domain in `capacitor.config.json` (§0/§2) first.

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
$25 developer fee, see §6).

**Before it'll log in:** add `https://localhost` to Firebase Console →
Authentication → Settings → Authorized domains, since the Android app's
webview origin is `https://localhost` even though it loads your real site.

The generated `android/` project isn't committed (see `.gitignore`) since
it's regenerated from `capacitor.config.json` — remove it from
`.gitignore` if you'd rather commit it for CI builds later.

## 5. iOS app — needs a Mac, but you have two options if you don't have one

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

## 6. App store submission checklist

Both stores will ask for these — have them ready before you start the
listing:

- **Privacy policy URL** — `https://your-domain.com/privacy.html` (§0/§2).
- **App icon** — 512×512 (Play) / 1024×1024 (App Store), no transparency
  for the App Store version.
- **Screenshots** — a few phone screenshots of the app in use (record from
  your own device once §4 is running).
- **Short + full description**, in Albanian (and English if you want
  broader reach).
- **Content rating questionnaire** — DayJob involves financial-ish content
  (the wallet), so answer honestly that no real payments occur yet.
- **Data safety / privacy "nutrition label" form** (Play Console → App
  content, App Store Connect → App Privacy) — declare what §0 lists:
  name/email/phone collected, ID photo stays on-device, no data sold.
- **Google Play:** one-time $25 registration fee, submit to the **Internal
  testing** track first (instant, no review) before Production.
- **Apple App Store:** $99/year Apple Developer Program, TestFlight for
  beta testing before a production review (usually 1–3 days).

## 7. When you're ready for real payments

The wallet/"Same-Day Pay" button is currently demo-only by design (see the
comments at the top of `firestore.rules`) — a user's client can freely
write their own `wallet` field today, which is fine for fake demo currency
but not for real money. Moving to real payouts needs, at minimum:

1. A payment processor with payout support (e.g. Stripe Connect, or a
   local Albanian gateway) — this is a business decision, not just code.
2. A Cloud Function that updates `wallet`/`completedShifts` as a *trusted
   server-side side effect* of an application status change, instead of
   the client writing it directly.
3. Locking `firestore.rules` so `wallet` is no longer client-writable
   (the file's comments mark exactly which lines to tighten once this
   exists).

This is its own project — flag it separately when you're ready to scope it.

## Order of operations, if doing this solo

1. Fill in the placeholders (§0).
2. Get the website live on Netlify (§1) — quick win, testable immediately.
3. Buy and connect your domain (§2).
4. Deploy the Firestore rules (§3) so the live site isn't running on
   whatever rules are currently set in the Firebase console.
5. Confirm the "Add to Home Screen" prompt shows up on your own phone.
6. Set up Android (§4), test on your own device via USB debugging.
7. Play Store internal testing track (free, immediate — no review wait)
   to get it on a few phones before public release (§6).
8. iOS whenever Mac access sorts itself out (§5).
9. Real payments (§7) — later, as its own project.
