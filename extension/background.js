// background.js — MV3 service worker (event-driven)
// Responsibilities:
// 1) receive REPHRASE requests from popup/content
// 2) fetch OpenAI securely using API key stored in chrome.storage
// 3) maintain an LRU cache in chrome.storage to avoid duplicate calls
// 4) reply back to sender with result or error

importScripts(); // placeholder — keep ES module allowed via manifest "type": "module"

// Minimal polyfill-safe wrapper for chrome.storage API using promises
const storage = {
  async get(key) {
    return new Promise((res) => chrome.storage.local.get(key, (items) => res(items)));
  },
  async set(obj) {
    return new Promise((res) => chrome.storage.local.set(obj, () => res()));
  },
  async remove(key) {
    return new Promise((res) => chrome.storage.local.remove(key, () => res()));
  }
};

// LRU cache helper (wrapper around storage; stored under key "__sr_lru_cache")
const CACHE_KEY = "__sr_lru_cache_v1";
const CACHE_MAX = 50; // keep small to limit storage usage

async function getCache() {
  const items = await storage.get(CACHE_KEY); //get current order and map
  return items[CACHE_KEY] || { order: [], map: {} };
}

async function putCacheItem(key, value) {
  const cache = await getCache();
  // remove if existing
  const idx = cache.order.indexOf(key);
  if (idx !== -1) cache.order.splice(idx, 1); //remove exisiting position
  cache.order.unshift(key); // most recent at front
  cache.map[key] = { value, ts: Date.now() }; //stores new value and timestamp
  // evict if too big
  while (cache.order.length > CACHE_MAX) {
    const oldest = cache.order.pop(); //lru
    delete cache.map[oldest];
  }
  await storage.set({ [CACHE_KEY]: cache });
}

async function getCacheItem(key) {
  const cache = await getCache();
  if (!cache.map[key]) return null;//If key is not found → return null. cache miss
  // mark as recently used
  const idx = cache.order.indexOf(key);   //cache hit , update LRU position
  if (idx !== -1) {
    cache.order.splice(idx, 1); //remove exisiting position
    cache.order.unshift(key); // most recent at front
    await storage.set({ [CACHE_KEY]: cache });
  }
  return cache.map[key].value;
}

// Safe hash for keys (same as your safeHash but simple)
function safeHash(s) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length && i < 256; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

// Get OpenAI key from chrome.storage.local
async function getOpenAIKey() {
  const res = await storage.get("OPENAI_KEY");
  return res.OPENAI_KEY || null;
}

// callOpenAI: encapsulates calling OpenAI/chat completion or text completion.
// returns { text } on success or throws an Error.
async function callOpenAI(prompt, opts = {}) {
  const key = await getOpenAIKey();
  if (!key) throw new Error("OPENAI_KEY_NOT_SET");

  // Use chat completions (gpt-4o-mini or gpt-4.1 etc.). Keep minimal body.
  const body = {
    model: opts.model || "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    max_tokens: opts.maxTokens || 400
  };

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`OpenAI Error ${resp.status}: ${text}`);
  }

  const data = await resp.json();
  // best-effort extraction
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return { text: content.trim() };
  // fallback
  return { text: JSON.stringify(data) };
}

// Respond helper for long-running async sendResponse
// This function exists to help respond asynchronously inside chrome.runtime.onMessage.
function asyncResponse(sendResponse, promise) {
  promise
    .then((value) => {
      sendResponse({ ok: true, value });
    })
    .catch((err) => {
      sendResponse({ ok: false, error: err.message || String(err) });
    });
}

// central message handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, payload } = message || {};

  // Rephrase request (from popup or content)
  if (type === "REPHRASE_TEXT") {
    const text = (payload && payload.text) || "";
    if (!text.trim()) {
      sendResponse({ ok: false, error: "EMPTY_TEXT" });
      return; // sync return
    }

    const key = safeHash(text);

    // Try cache first
    asyncResponse(
      (async () => {
        const cached = await getCacheItem(key);
        if (cached) {
          sendResponse({ ok: true, value: { text: cached, cached: true } });
          return;
        }

        // Not cached — call OpenAI
        try {
          const prompt = `Rephrase the following text professionally and concisely.\n\nText:\n${text}`;
          const { text: result } = await callOpenAI(prompt, { model: "gpt-4o-mini" });
          // Save to cache
          await putCacheItem(key, result);
          sendResponse({ ok: true, value: { text: result, cached: false } });
        } catch (err) {
          sendResponse({ ok: false, error: err.message || String(err) });
        }
      })()
    )

    return true; // indicates async response
  }

  // Background receives content script request to rephrase selected page text
  if (type === "PAGE_REPHRASE") {
    const text = (payload && payload.text) || "";
    if (!text.trim()) {
      sendResponse({ ok: false, error: "EMPTY_TEXT" });
      return;
    }
    asyncResponse(
      (async () => {
        const key = safeHash(text);
        const cached = await getCacheItem(key);
        if (cached) {
          sendResponse({ ok: true, value: { text: cached, cached: true } });
          return;
        }
        try {
          const prompt = `Rephrase the following text professionally and concisely.\n\nText:\n${text}`;
          const { text: result } = await callOpenAI(prompt, { model: "gpt-4o-mini" });
          await putCacheItem(key, result);
          sendResponse({ ok: true, value: { text: result, cached: false } });
        } catch (err) {
          sendResponse({ ok: false, error: err.message || String(err) });
        }
      })()
    );
    return true;
  }

  // Add a simple ping
  if (type === "PING") {
    sendResponse({ ok: true, time: Date.now() });
    return;
  }

  // Option to clear cache (for debugging)
  if (type === "CLEAR_CACHE") {
    asyncResponse(
      (async () => {
        await storage.set({ [CACHE_KEY]: { order: [], map: {} } });
        sendResponse({ ok: true });
      })());

    return true;
  }

  // Unknown message
  sendResponse({ ok: false, error: "UNKNOWN_MESSAGE" });
  return;
});
