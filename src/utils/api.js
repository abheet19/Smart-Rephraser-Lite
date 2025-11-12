// src/utils/api.js

// Simulate server latency
export const sleep = (ms = 800) => new Promise((r) => setTimeout(r, ms));

// Fake AI transformation (same logic as before)
export function fakeAIRephrase(text) {
  const synonyms = {
    quick: "speedy",
    happy: "joyful",
    fast: "rapid",
    smart: "intelligent",
  };
  return text
    .split(" ")
    .map((w) => synonyms[w.toLowerCase()] || w)
    .reverse()
    .join(" ");
}

// LocalStorage helpers
const CACHE_KEY = "sr_rephrase_cache_v1";

export function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY)) || {};
  } catch (e) {
    return e;
  }
}
export function saveCache(cache) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

// High-level API: rephrase with simulated latency
export async function rephraseWithCompute(text) {
  // NOTE: This simulates server computation and is where a backend call would happen.
  await sleep(800); // simulate network + compute
  return fakeAIRephrase(text); // return computed result
}
