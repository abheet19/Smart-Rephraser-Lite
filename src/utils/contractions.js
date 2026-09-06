// src/utils/contractions.js
//
// Two small, deliberately non-exhaustive maps used by paraphrase.js:
//   - CONTRACTIONS: contracted form -> expanded form ("don't" -> "do not")
//   - EXPANSIONS: the reverse, used only when the input has no contractions
//     to expand -- see contractOrExpand() in paraphrase.js. Rephrasing a
//     sentence that already reads as formal ("I do not agree") by tightening
//     it to "I don't agree" is as real a transform as the other direction.
export const CONTRACTIONS = {
  "aren't": "are not",
  "can't": "cannot",
  "couldn't": "could not",
  "didn't": "did not",
  "doesn't": "does not",
  "don't": "do not",
  "hadn't": "had not",
  "hasn't": "has not",
  "haven't": "have not",
  "he'd": "he would",
  "he'll": "he will",
  "he's": "he is",
  "i'd": "i would",
  "i'll": "i will",
  "i'm": "i am",
  "i've": "i have",
  "isn't": "is not",
  "it'd": "it would",
  "it'll": "it will",
  "it's": "it is",
  "let's": "let us",
  "shouldn't": "should not",
  "that's": "that is",
  "there's": "there is",
  "they'd": "they would",
  "they'll": "they will",
  "they're": "they are",
  "they've": "they have",
  "wasn't": "was not",
  "we'd": "we would",
  "we'll": "we will",
  "we're": "we are",
  "we've": "we have",
  "weren't": "were not",
  "what's": "what is",
  "won't": "will not",
  "wouldn't": "would not",
  "you'd": "you would",
  "you'll": "you will",
  "you're": "you are",
  "you've": "you have",
};

export const EXPANSIONS = Object.fromEntries(
  Object.entries(CONTRACTIONS).map(([contracted, expanded]) => [
    expanded,
    contracted,
  ]),
);
