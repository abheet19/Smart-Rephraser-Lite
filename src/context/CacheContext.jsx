// src/context/CacheContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { fakeAIRephrase } from "../utils/api";

const CacheContext = createContext(null);

export function CacheProvider({ children }) {
  const [store, setStore] = useState(() => {
    const saved = localStorage.getItem("rephrase-cache");
    return saved ? JSON.parse(saved) : {};
  });
  const [lastInput, setLastInput] = useState("");

  // ✅ 1️⃣ Stable functions with useCallback
  const get = useCallback((key) => store[key], [store]);

  const set = useCallback((key, value) => {
    setStore((prev) => {
      const updated = { ...prev, [key]: value };
      localStorage.setItem("rephrase-cache", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clear = useCallback(() => {
    localStorage.removeItem("rephrase-cache");
    setStore({});
    setLastInput("");
  }, []);

  const rephrase = useCallback(
    async (text) => {
      if (store[text]) {
        console.log("Cache hit for:", text);
        return { fromCache: true, result: store[text] };
      }
      const result = fakeAIRephrase(text);
      set(text, result);
      setLastInput(text);
      return { fromCache: false, result };
    },
    [store, set],
  );

  // ✅ 2️⃣ Stable context value
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
