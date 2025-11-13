import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import ErrorBoundary from "./components/ErrorBoundary";
import "./styles/popup.css";
import { sendEvent } from "./utils/telemetry";

// Capture unhandled promise rejections (safe)
window.addEventListener("unhandledrejection", (ev) => {
  sendEvent("unhandledrejection", { reason: String(ev.reason) });
});

// NO SERVICE WORKER REGISTRATION IN EXTENSION POPUP ❌
// NO SW UPDATE FLOW ❌
// NO showUpdateToast ❌

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
