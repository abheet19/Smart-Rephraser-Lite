import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        entryFileNames: "assets/[name].[hash].js",
        chunkFileNames: "assets/[name].[hash].js",
        assetFileNames: "assets/[name].[hash].[ext]"
      }
    }
  },
  server: {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable"
    }
  },
  test: {
    exclude: ["tests/**", "node_modules/**"], // 👈 ignore E2E tests
  },
});