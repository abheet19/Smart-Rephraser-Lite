// sw.js  —  basic "network-first with offline fallback"

const CACHE_NAME = "sr-lite-cache-v6";
// Only the two paths every build actually produces. The three that used to
// be listed here (styles/main.css, scripts/app.js, scripts/utils.js) are
// Day-1 vanilla-JS filenames the React migration replaced with content-hashed
// bundles under assets/ -- none of them exist in dist. cache.addAll() is
// all-or-nothing, so the moment one entry 404s the whole install rejects and
// the service worker never activates; the fetch handler below still caches
// the real hashed bundles at runtime as they're requested.
const ASSETS = ["./", "./index.html"];
// Ignore WebSocket + HMR traffic (dev only)
const IGNORE_LIST = ["@vite", "hot-update", "sockjs-node", "hmr", "vite-dev"];

// ----- INSTALL -----
self.addEventListener("install", (evt) => {
  console.log("SW v5: installing…");
  evt.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
});

// ----- ACTIVATE -----
self.addEventListener("activate", (evt) => {
  console.log("SW v5: activating…");
  evt.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.map((k) => (k !== CACHE_NAME ? caches.delete(k) : null)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

// ----- FETCH -----
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);
  // 🔒 Skip WebSocket and HMR traffic so Vite's dev server stays alive
  if (
    url.protocol.startsWith("ws") ||
    IGNORE_LIST.some((term) => url.href.includes(term))
  ) {
    return;
  }
  // Example: API calls to /api/rephrase -> network first then cache
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // optionally clone & cache
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // For other GET requests, serve cache first
  if (request.method === "GET") {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request)),
    );
  }
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
