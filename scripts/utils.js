// Utility: Simple debounce to avoid firing too often
function debounce(fn, delay = 400) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

// Utility: Mock AI logic
function fakeAIRephrase(text) {
  // Reverse words & random synonym swap (toy logic)
  const synonyms = { quick: "speedy", happy: "joyful", fast: "rapid" };
  return text
    .split(" ")
    .map(word => synonyms[word.toLowerCase()] || word)
    .reverse()
    .join(" ");
}
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}