const CACHE_NAME = "sr-lite-cache-v3";
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./styles/main.css",
  "./scripts/app.js",
  "./scripts/utils.js"
];

self.addEventListener("install", event => {
  console.log("SW: installing…");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
      .then(() => console.log("SW: assets cached"))
      .catch(err => console.error("SW: cache addAll failed →", err))
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : null)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        console.log("SW: serving from cache →", event.request.url);
        return cached;
      }

      return fetch(event.request)
        .then(netRes => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, netRes.clone());
            console.log("SW: cached new →", event.request.url);
            return netRes;
          });
        })
        .catch(async () => {
          // Handle offline navigation (app shell)
          if (event.request.mode === "navigate") {
            console.log("SW: offline fallback → index.html");
            return await caches.match("./index.html");
          }
        });
    })
  );
});