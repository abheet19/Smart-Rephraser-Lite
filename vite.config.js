import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "src/extension-entry/popup-react-entry.jsx"),
      },
      output: {
        dir: "extension",
        entryFileNames: "popup.js",    // <-- output popup.js HERE
        assetFileNames: "assets/[name].[ext]",
      },
    },
    emptyOutDir: false,  // don't delete extension folder
  },
});
