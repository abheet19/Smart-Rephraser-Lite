// sw.js  —  basic "network-first with offline fallback"

const CACHE_NAME = "sr-lite-cache-v5";
const ASSETS = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./scripts/app.js",
  "./scripts/utils.js",
];

// ----- INSTALL -----
self.addEventListener("install", (evt) => {
  console.log("SW: installing…");
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ----- ACTIVATE -----
self.addEventListener("activate", (evt) => {
  console.log("SW: activating…");
  evt.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

// ----- FETCH -----
self.addEventListener("fetch", (evt) => {
  if (evt.request.method !== "GET") return;

  const req = evt.request;

  evt.respondWith(
    fetch(req)
      .then((netRes) => {
        if (!netRes || netRes.status !== 200 || netRes.type === "opaque") {
          return netRes;
        }

        //  Skip requests from extensions or devtools
        const url = new URL(req.url);
        if (url.protocol === "chrome-extension:" || url.protocol === "devtools:") {
          return netRes;
        }

        const resClone = netRes.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));

        return netRes;
      })
      .catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        if (req.mode === "navigate") return caches.match("./index.html");
      })
  );
});