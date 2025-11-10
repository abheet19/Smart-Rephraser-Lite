// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Register service worker and update flow
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then(registration => {
        console.log("Service Worker registered:", registration);

        registration.onupdatefound = () => {
          const installing = registration.installing;
          console.log("New SW found:", installing);

          installing.onstatechange = () => {
            if (installing.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // New update available
                console.log("New content available; please refresh.");
                // Show in‐app toast
                showUpdateToast(() => {
                  registration.waiting.postMessage({ type: "SKIP_WAITING" });
                });
              } else {
                console.log("Content cached for offline use.");
              }
            }
          };
        };
      })
      .catch(err => console.error("SW registration failed:", err));
  });

  // Listen for controlling service worker changes
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Utility for toast (simple)
function showUpdateToast(onRefresh) {
  const toast = document.createElement("div");
  toast.style = "position:fixed;bottom:16px;right:16px;padding:12px;background:#323232;color:#fff;border-radius:4px;cursor:pointer;z-index:1000";
  toast.textContent = "New version available. Click to update.";
  toast.onclick = onRefresh;
  document.body.appendChild(toast);
}
