// Utility: Simple debounce to avoid firing too often
export function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Utility: Mock AI logic
export function fakeAIRephrase(text) {
  // Reverse words & random synonym swap (toy logic)
  const synonyms = { quick: "speedy", happy: "joyful", fast: "rapid" };
  return text
    .split(" ")
    .map(word => synonyms[word.toLowerCase()] || word)
    .reverse()
    .join(" ");
}
export async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}