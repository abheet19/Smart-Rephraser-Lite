// src/utils/api.js
//
// The app's only "API" -- there is no backend and no key, so rephrasing is
// the real, synchronous, client-side pipeline in paraphrase.js. The small
// delay below isn't simulated network latency (there's nothing to wait on);
// it's a floor so the loading state in RephraseEditor is visible even though
// the computation itself finishes in under a millisecond.
import { paraphrase } from "./paraphrase";

const MIN_VISIBLE_LOADING_MS = 250;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function rephrase(text) {
  const [result] = await Promise.all([
    Promise.resolve(paraphrase(text)),
    sleep(MIN_VISIBLE_LOADING_MS),
  ]);
  return result;
}
