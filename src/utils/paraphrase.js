// src/utils/paraphrase.js
//
// A genuinely-client-side paraphraser. Smart Rephraser Lite has no backend
// and no API key -- everything below runs synchronously in the browser, with
// no network call anywhere in the pipeline. It won't rival a hosted LLM, but
// it performs a real rephrasing rather than a placeholder transform:
//
//   1. trim filler words          ("basically", "just", "sort of", ...)
//   2. expand or contract         ("don't" <-> "do not", whichever the
//                                   sentence doesn't already have)
//   3. substitute synonyms        word-for-word, via SYNONYMS
//   4. reorder subordinate clauses ("Although X, Y." -> "Y although X.")
//
// Each stage is independently testable and skips cleanly when it doesn't
// apply, so a short or unusual sentence degrades to "fewer changes" rather
// than broken output.
import { SYNONYMS, FILLER_WORDS } from "./synonyms";
import { CONTRACTIONS, EXPANSIONS } from "./contractions";

const SUBORDINATORS = [
  "although",
  "though",
  "because",
  "since",
  "while",
  "if",
  "when",
  "after",
  "before",
  "unless",
  "whereas",
];

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Re-applies the casing of `original` to `replacement`: matches ALL CAPS,
// Capitalized, or lowercase so a substitution doesn't shout or look wrong at
// the start of a sentence.
function applyCase(original, replacement) {
  if (
    original === original.toUpperCase() &&
    original !== original.toLowerCase()
  ) {
    return replacement.toUpperCase();
  }
  if (original[0] === original[0].toUpperCase()) {
    return replacement[0].toUpperCase() + replacement.slice(1);
  }
  return replacement;
}

// Removes filler words/phrases as whole words only -- never mid-word (so
// "classic" is untouched even though it contains "las... actually" no
// substring of any filler). Multi-word fillers are matched before single
// words so "kind of" doesn't get stranded as a leftover "of".
export function stripFillerWords(text) {
  let out = text;
  const phrases = [...FILLER_WORDS].sort((a, b) => b.length - a.length);
  for (const phrase of phrases) {
    const re = new RegExp(`\\b${escapeRegExp(phrase)}\\b\\s*`, "gi");
    out = out.replace(re, "");
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

// Expands contractions when present ("don't" -> "do not"); otherwise
// contracts the formal equivalents it finds ("do not" -> "don't"). Only one
// direction ever runs per sentence, so it never fights itself.
export function contractOrExpand(text) {
  const hasContraction = Object.keys(CONTRACTIONS).some((c) =>
    new RegExp(`\\b${escapeRegExp(c)}\\b`, "i").test(text),
  );

  const map = hasContraction ? CONTRACTIONS : EXPANSIONS;
  let out = text;
  for (const [from, to] of Object.entries(map)) {
    const re = new RegExp(`\\b${escapeRegExp(from)}\\b`, "gi");
    out = out.replace(re, (match) => applyCase(match, to));
  }
  return out;
}

// Word-for-word substitution against SYNONYMS. Runs after filler/contraction
// handling so it only ever sees content words.
export function substituteSynonyms(text) {
  return text.replace(/[A-Za-z]+/g, (word) => {
    const synonym = SYNONYMS[word.toLowerCase()];
    return synonym ? applyCase(word, synonym) : word;
  });
}

// Substituting a synonym can leave the wrong indefinite article behind
// ("a excellent offering", from "a great offering" -> "great" -> "excellent").
// Re-agrees "a"/"an" with whatever word now follows it.
export function fixArticles(text) {
  return text.replace(
    /\b([Aa])n?(\s+)([A-Za-z])/g,
    (_full, article, space, nextChar) => {
      const correct = /[aeiouAEIOU]/.test(nextChar) ? "an" : "a";
      const cased =
        article === "A" ? correct[0].toUpperCase() + correct.slice(1) : correct;
      return `${cased}${space}${nextChar}`;
    },
  );
}

// "Although it was raining, we went out." -> "We went out although it was
// raining." A real structural reorder, not just word swaps -- but only fires
// when the shape is unambiguous (leading subordinator, one comma) so it never
// mangles a sentence it doesn't confidently understand.
export function reorderClause(text) {
  const match = new RegExp(`^(${SUBORDINATORS.join("|")})\\b`, "i").exec(
    text.trim(),
  );
  if (!match) return text;

  const trimmed = text.trim();
  const commaIndex = trimmed.indexOf(",");
  if (commaIndex === -1 || commaIndex === trimmed.length - 1) return text;

  const subordinator = match[1];
  const clauseA = trimmed.slice(subordinator.length, commaIndex).trim();
  const clauseB = trimmed.slice(commaIndex + 1).trim();
  if (!clauseA || !clauseB) return text;

  const capitalizedB = clauseB[0].toUpperCase() + clauseB.slice(1);
  return `${capitalizedB} ${subordinator.toLowerCase()} ${clauseA}`;
}

function capitalizeFirst(text) {
  const i = text.search(/[A-Za-z]/);
  if (i === -1) return text;
  return text.slice(0, i) + text.charAt(i).toUpperCase() + text.slice(i + 1);
}

// Runs one sentence through the full pipeline, punctuation-safe: the
// sentence-ending mark is peeled off first and reattached at the end so none
// of the stages above have to reason about it.
function paraphraseSentence(sentence) {
  const trailingMatch = /([.!?]+)\s*$/.exec(sentence);
  const punctuation = trailingMatch ? trailingMatch[1] : "";
  const body = trailingMatch
    ? sentence.slice(0, trailingMatch.index)
    : sentence;

  if (!body.trim()) return sentence;

  let out = stripFillerWords(body);
  out = contractOrExpand(out);
  out = substituteSynonyms(out);
  out = fixArticles(out);
  out = reorderClause(out);
  out = capitalizeFirst(out.trim());

  return punctuation ? out + punctuation : out;
}

// Splits on sentence-ending punctuation while keeping it attached to the
// sentence it closes, so "Wait. Really?" stays two sentences, not one run-on.
function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

// Public entry point. Synchronous and pure -- no network, no randomness -- so
// the same input always produces the same output, which is what makes the
// result cacheable in CacheContext.
export function paraphrase(text) {
  if (!text || !text.trim()) return "";
  return splitSentences(text.trim()).map(paraphraseSentence).join(" ");
}
