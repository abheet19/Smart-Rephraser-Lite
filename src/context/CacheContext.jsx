import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { loadCache, saveCache, rephraseWithCompute } from "../utils/api";

// Create context
const CacheContext = createContext(null);

// Provider component
export function CacheProvider({ children }) {
  // store is a JS object mapping inputText -> result
  const [store, setStore] = useState(() => loadCache());
  const [lastInput,setLastInput]=useState("")
  // Persist to localStorage whenever store changes
  useEffect(() => {
    saveCache(store);
  }, [store]);

  // get cached value (sync)
  const get = text => store[text];

  // set cached value (sync)
  const set = (text, result) => setStore(prev => ({ ...prev, [text]: result }));

  // clear cache
  const clear = () => {
    setStore({})
    setLastInput("")
};

  // high-level rephrase: check cache, else compute & set
  const rephrase = async text => {
    if (!text) return "";
    setLastInput(text)
    if (store[text]) {
      // Cache hit
      return { fromCache: true, result: store[text] };
    }
    // Cache miss: compute (calls simulated backend)
    const computed = await rephraseWithCompute(text);
    set(text, computed);
    return { fromCache: false, result: computed };
  };

  // memoize context value to avoid unnecessary rerenders
  const value = useMemo(() => ({ store,lastInput,get, set, clear, rephrase }), [store]);

  return <CacheContext.Provider value={value}>{children}</CacheContext.Provider>;
}

// Hook for consuming cache easily
export const useCache = () => {
  const ctx = useContext(CacheContext);
  if (!ctx) throw new Error("useCache must be used within CacheProvider");
  return ctx;
};