import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  build: {
    outDir: "dist",
    emptyOutDir: true,

    rollupOptions: {
      input: {
        web: resolve(__dirname, "index.html"),
        popup: resolve(__dirname, "src/extension-entry/popup-react-entry.jsx"),
      },

      output: {
        entryFileNames(chunk) {
          if (chunk.name === "popup") {
            return "extension/popup.js"; // ⚡ put popup.js in dist/extension/
          }
          return "assets/[name]-[hash].js"; // ⚡ normal Vite assets
        },
        assetFileNames: "assets/[name]-[hash].[ext]",
      },
    },
  },

  test: {
    // Ignore all E2E test folders + Playwright tests
    exclude: [
      "tests/e2e/**",
      "tests/**/*.e2e.js",
      "tests/**/*.e2e.spec.js",
      "**/*.e2e.js",
      "**/*.e2e.spec.js",
      "playwright/**",
      "playwright.config.*",
      "extension/**",   // avoid running tests inside built extension
      "node_modules/**"
    ],

    // Only include unit tests (optional but clean)
    include: ["src/**/*.test.{js,jsx,ts,tsx}", "tests/unit/**/*.test.js"]
  },
});