import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App";
import { CacheProvider } from "../context/CacheContext";
import ErrorBoundary from "../components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <CacheProvider>
        <App />
      </CacheProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
