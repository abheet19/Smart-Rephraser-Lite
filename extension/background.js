// background.js — Chrome Extension Service Worker

console.log("Smart-Rephraser background running...");

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "GET_CACHE_STATS") {
    chrome.storage.local.get(["rephrase-cache"], (data) => {
      const store = data["rephrase-cache"] || {};
      sendResponse({
        entries: Object.keys(store).length
      });
    });

    return true; // keep sendResponse alive
  }

  if (msg.type === "CLEAR_CACHE") {
    chrome.storage.local.remove("rephrase-cache", () => {
      sendResponse({ cleared: true });
    });

    return true;
  }
});
