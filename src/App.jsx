import React, { Suspense, lazy } from "react";
import { CacheProvider } from "./context/CacheContext";
import RephraseEditor from "./components/RephraseEditor";
import Result from "./components/Result";

// Lazy-load heavy visualization (optional)
const LazyResult = lazy(() => import("./components/LazyResult"));
export default function App() {
  return (
    <CacheProvider>
      <div className="page">
        <main className="app">
          <header className="app-header">
            <h1>Smart Rephraser Lite</h1>
            <p className="app-subtitle">
              Client-side rephrasing, no server round-trip required.
            </p>
          </header>

          {/* Editor handles input + triggers cache updates */}
          <RephraseEditor />
          {/* Result reacts automatically via context (no props needed) */}
          <Result />
          {/* Suspense shows fallback until LazyResult bundle loads */}
          <Suspense
            fallback={
              <div className="suspense-fallback">Loading results...</div>
            }
          >
            {/* Optional fancy visualization, also reactive via cache */}
            <LazyResult />
          </Suspense>
        </main>
      </div>
    </CacheProvider>
  );
}
