import React, { useMemo } from "react";
import { useCache } from "../context/CacheContext";

export default function LazyResult() {
  const { store, lastInput } = useCache();

  // Compute tokens only if there’s a valid input/result
  const tokens = useMemo(() => {
    if (!lastInput || !store[lastInput]) return [];
    const text = store[lastInput];
    return text.split(" ").map((t, i) => (
      <span key={i} className="token">{t}</span>
    ));
  }, [store, lastInput]);

  return (
    <div className="lazy-result">
      <h3>Rich Visualization</h3>
      <div className="tokens">
        {tokens.length ? tokens : <em>No text to visualize.</em>}
      </div>
    </div>
  );
}