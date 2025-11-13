// Light-weight telemetry: logs to console in dev; posts to backend (or a third-party) in prod.
const ENV = import.meta.env.MODE || "development";
const TELEMETRY_ENDPOINT = import.meta.env.VITE_TELEMETRY_URL || "/telemetry"; // replace in prod

export function safeHash(s) {
  // simple non-crypto fingerprint: length + small hash — reduce PII risk
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length && i < 64; i++) {
    h ^= s.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
  }
  return (h >>> 0).toString(16);
}

export function sendEvent(name, payload = {}, opts = {}) {
  // payload should be non-sensitive (lengths, booleans, numeric)
  const event = {
    ts: new Date().toISOString(),
    name,
    env: ENV,
    ...payload,
  };
  // Disable telemetry for Chrome extension (popup env)
  if (chrome?.runtime?.id) {
    console.log(`[telemetry disabled in extension]`, event);
    return Promise.resolve();
  }
  if (ENV === "development") {
    console.log(`[${name}]`, event);
    return Promise.resolve();
  }

  // Rate limit / sample
  const sampleRate = opts.sampleRate ?? 0.1;
  if (Math.random() > sampleRate) return Promise.resolve();

  // Send (fire-and-forget)
  return fetch(TELEMETRY_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  }).catch((err) => {
    // swallow network errors: don't break the app
    console.warn("Telemetry error", err);
  });
}
