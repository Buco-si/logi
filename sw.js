// Logbuch ESE – Offline-Cache. Speichert nur den Programmcode, niemals Einträge.
// Holt immer zuerst die neueste Version vom Server (am Browser-Zwischenspeicher vorbei);
// nur ohne Internet wird die gespeicherte Kopie verwendet.
const CACHE = "logbuch-ese-v17";
const FILES = ["./", "index.html", "manifest.webmanifest", "icon.svg"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache:"reload" }))))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request.url, { cache:"no-cache", credentials:"same-origin" })
    .then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch:true }).then(r => r || caches.match("index.html"))));
});
