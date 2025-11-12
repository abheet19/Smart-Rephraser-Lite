# 🧠 Smart Rephraser Lite — Learning & Build Log

> A 14-day full-stack web extension learning plan inspired by QuillBot’s frontend architecture.  
> This repo documents daily progress — code, theory, and project iterations.

---

## 🚀 Project Overview

**Smart Rephraser Lite** is a browser-based AI writing assistant prototype built step-by-step across 14 days.  
The goal is to master the frontend ecosystem (Vanilla JS → React + TypeScript → Chrome Extensions → Node API) through hands-on, incremental development.

---

## 📅 Day 1 — Core Frontend Foundations

### 🎯 **Objective**

Establish deep fluency with HTML, CSS, and Vanilla JavaScript (DOM traversal, events, async, and prototypes).  
Build the first working version: a standalone browser app with rephrasing logic.

### 🧠 **Concepts Covered**

- HTML5 semantics, CSS Flexbox & Grid basics
- DOM tree, event bubbling & delegation
- `getElementById`, `querySelector`, `closest`, and `children`
- `addEventListener`, propagation, and dynamic element creation
- `setTimeout`, `async/await`, and Promises
- Debouncing input and state updates
- Modular project structure and Git commit hygiene

### 🧩 **Implementation Summary**

- Initialized project with `lite-server`
- Created semantic UI layout (header, textarea, buttons, output section)
- Styled responsive dark theme (`main.css`)
- Implemented JavaScript logic:
  ```js
  btn.addEventListener("click", async () => {
    const inputText = textArea.value.trim();
    if (!inputText) return (output.textContent = "Please enter text.");
    output.textContent = "Thinking...";
    await new Promise((r) => setTimeout(r, 800));
    output.textContent = fakeAIRephrase(inputText);
  });
  ```

### 🧩 **Utils**:

- debounce(fn, delay) for input control
- fakeAIRephrase() mock AI logic

Practiced DOM inspection + event bubbling in DevTools

### 🧩 **Exercises**:

- DOM Traversal (closest, children.length)

- Event Bubbling Visualization

- Async sleep function + await

- Prototype chain exploration

Day 2

> **Modern JavaScript + Tooling Setup (Foundation for React)**

---

## 🎯 Objective

Upgrade the Day 1 project to use **modern ES6+ JavaScript**, modularize the codebase, and set up **Vite** for a production-like developer workflow.  
This day bridges the gap between Vanilla JS and React.

---

## 🧠 Key Concepts Covered

- ES Modules (`import` / `export`)
- Arrow Functions & Lexical `this`
- Destructuring, Spread & Rest Operators
- Promises & Async/Await
- Functional Patterns: `map`, `filter`, `reduce`
- Build Tooling with **Vite** (for bundling + hot-reload)
- Code Quality Setup with **ESLint** + **Prettier**

---

## 1️⃣ Module Setup

Enable ES modules in HTML:

```html
<script type="module" src="./scripts/app.js"></script>

## 🧱 Implementation Summary - Refactor utils.js - Refactor app.js - Install and
Configure Vite - Update package.json - Add Linting + Formatting - Modern DOM
Exercises # Exercise Concept 1 Dynamic creation with DocumentFragment Batch DOM
updates efficiently 2 Destructured event objects Cleaner callbacks 3 Attribute
binding via dataset Custom lightweight state 4 Declarative re-rendering Manual
state-driven DOM updates 5 Batch vs single append Performance comparison 6 Event
delegation Scalable event handling 7 Intersection Observer API Lazy loading
fundamentals
```
