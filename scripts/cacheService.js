import { fakeAIRephrase, sleep } from "./utils.js";

const CACHE_KEY = "rephrase_cache_v1";

function getCache() {
  try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || {}; }
  catch { return {}; }
}

function saveCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify(data));
}

export async function cachedRephrase(inputText) {
  const cache = getCache();
  if (cache[inputText]) {
    console.log("%c[Cache hit]", "color:green", inputText);
    return cache[inputText];
  }

  console.log("%c[Cache miss]", "color:red", inputText);
  await sleep(800);
  const rephrased = fakeAIRephrase(inputText);
  cache[inputText] = rephrased;
  saveCache(cache);
  return rephrased;
}

export function clearCache() {
  localStorage.removeItem(CACHE_KEY);
  console.log("Cache cleared");
}
