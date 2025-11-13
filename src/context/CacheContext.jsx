// src/context/CacheContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { fakeAIRephrase } from "../utils/api";

async function loadChromeCache() {
  return new Promise((resolve) => {
    // Web mode → fallback to localStorage
    if (!chrome?.storage?.local) {
      const saved = localStorage.getItem("rephrase-cache");
      resolve(saved ? JSON.parse(saved) : {});
      return;
    }

    // Extension mode → use chrome.storage.local
    chrome.storage.local.get(["rephrase-cache"], (data) => {
      resolve(data["rephrase-cache"] || {});
    });
  });
}

async function saveChromeCache(store) {
  if (chrome?.storage?.local) {
    chrome.storage.local.set({ "rephrase-cache": store });
  } else {
    localStorage.setItem("rephrase-cache", JSON.stringify(store));
  }
}

const CacheContext = createContext(null);

export function CacheProvider({ children }) {
  const [store, setStore] = useState({});
  const [lastInput, setLastInput] = useState("");

  // -----------------------------------------------
  // 3. Load cache async on mount (supports extension)
  // -----------------------------------------------
  useEffect(() => {
    loadChromeCache().then((data) => {
      setStore(data);
    });
  }, []);

  // Stable functions
  const get = useCallback((key) => store[key], [store]);

  const set = useCallback((key, value) => {
    setStore((prev) => {
      const updated = { ...prev, [key]: value };
      saveChromeCache(updated);
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    saveChromeCache({});
    setStore({});
    setLastInput("");
  }, []);

  const rephrase = useCallback(
    async (text) => {
      if (store[text]) {
        return { fromCache: true, result: store[text] };
      }

      const result = fakeAIRephrase(text);
      set(text, result);
      setLastInput(text);

      return { fromCache: false, result };
    },
    [store, set],
  );

  const value = useMemo(
    () => ({ store, lastInput, get, set, clear, rephrase }),
    [store, lastInput, get, set, clear, rephrase],
  );

  return (
    <CacheContext.Provider value={value}>{children}</CacheContext.Provider>
  );
}

export function useCache() {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error("useCache must be used within CacheProvider");
  return ctx;
}
