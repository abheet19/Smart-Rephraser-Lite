import { debounce, fakeAIRephrase } from "./utils.js";

const input = document.getElementById("inputText");
const output = document.getElementById("outputBox");
const rephraseBtn = document.getElementById("rephraseBtn");
const clearBtn = document.getElementById("clearBtn");

async function rephraseHandler() {
  const text = input.value.trim();
  if (!text) {
    output.textContent = "⚠️ Please enter some text.";
    return;
  }
  output.textContent = "Thinking...";
  await sleep(1000);  // simulate latency
  const newText = fakeAIRephrase(text);
  output.textContent = newText;
}

rephraseBtn.addEventListener("click", rephraseHandler);
clearBtn.addEventListener("click", () => {
  input.value = "";
  output.textContent = "";
});

// Live preview (debounced)
input.addEventListener(
  "input",
  debounce(() => {
    output.textContent = fakeAIRephrase(input.value);
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

