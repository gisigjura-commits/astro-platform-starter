// DayJob service worker — just enough to satisfy PWA installability and
// let the app shell open instantly / offline. It deliberately does NOT
// cache anything from firestore.googleapis.com or googleapis.com, since
// job/application data must always come from the network to stay live.

const CACHE_NAME = "dayjob-shell-v1";
const SHELL_FILES = ["/index.html", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Never cache Firebase/Firestore/Auth traffic — always hit the network.
  if (url.hostname.includes("googleapis.com") || url.hostname.includes("firebaseio.com")) {
    return;
  }

  // App shell: network-first, falling back to cache when offline.
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
