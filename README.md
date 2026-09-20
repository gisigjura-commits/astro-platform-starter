# DayJob — Punë e ditës

A same-day job marketplace: workers find shifts for today/tomorrow/this
week, businesses post jobs and fill them within hours. Built as a single
self-contained PWA (`public/index.html`) backed by Firebase
Auth/Firestore, deployed as a static site on Netlify, and wrapped with
Capacitor for Android/iOS app store builds.

See **[SETUP.md](./SETUP.md)** for the full walkthrough: deploying the
website, pushing Firestore security rules, and building the Android/iOS
apps.

## Project layout

| Path                  | What it is                                                          |
| :--------------------- | :------------------------------------------------------------------- |
| `public/index.html`    | The whole app — UI, styles, and Firebase client logic in one file   |
| `public/manifest.json` | PWA manifest (installable "Add to Home Screen")                     |
| `public/sw.js`         | Service worker — app-shell caching, never caches Firebase traffic   |
| `public/icons/`        | App icons (placeholders — swap for real art, see SETUP.md §0)       |
| `firestore.rules`      | Firestore security rules — deploy with `firebase deploy --only firestore:rules` |
| `firebase.json` / `.firebaserc` | Firebase CLI config, pinned to the `daily-job-c351c` project |
| `capacitor.config.json`| Wraps the live Netlify site as an installable Android/iOS app       |

## Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |

## Developing locally

| Prerequisites                                                                |
| :--------------------------------------------------------------------------- |
| [Node.js](https://nodejs.org/) v18.20.8+.                                    |

1. Clone this repository, then run `npm install` in its root directory.
2. Run `npm run dev` and open `http://localhost:4321`.

Because the app is a static file talking directly to Firebase, `npm run
dev` is just Astro serving `public/` — no backend to run locally. Sign-in
will only work once `localhost` (or whatever port Astro picks) is added to
Firebase Console → Authentication → Settings → Authorized domains.
