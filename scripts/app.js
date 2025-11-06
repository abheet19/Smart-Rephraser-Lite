import { debounce, fakeAIRephrase } from "./utils.js";
import { cachedRephrase, clearCache } from "./cacheService.js";
import { measureAsync } from "./profiler.js";

const input = document.getElementById("inputText");
const output = document.getElementById("outputBox");
const buttons = document.querySelector(".actions");

async function handleRephrase() {
  const text = input.value.trim();
  if (!text) {
    output.textContent = "⚠️ Please enter some text.";
    return;
  }
  output.textContent = "Thinking...";
  const { duration, result } = await measureAsync(() => cachedRephrase(text));
  console.log(`Rephrased in ${duration.toFixed(2)}ms`);

  output.textContent = result;
}


buttons.addEventListener("click", e => {
  if (e.target.id === "rephraseBtn") handleRephrase();
  if (e.target.id === "clearBtn") { input.value = ""; output.textContent = ""; }
  if (e.target.id === "resetCacheBtn") clearCache();
});

// Live preview (debounced)
input.addEventListener(
  "input",
  debounce(async () => {
    const text = input.value.trim();
    if (!text) return (output.textContent = "");
    const { result } = await measureAsync(() => cachedRephrase(text));
    output.textContent = result;
  }, 600)
);
const themeBtn = document.createElement("button");
themeBtn.textContent = "🌓 Toggle Theme";
document.querySelector("header").appendChild(themeBtn);

themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("light");
  const theme = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem("theme", theme);
});

// Load saved theme
if (localStorage.getItem("theme") === "light")
  document.body.classList.add("light");

