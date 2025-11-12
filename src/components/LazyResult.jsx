import React, { useMemo, useEffect } from "react";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";
import { sendEvent } from "../utils/telemetry";

export default function LazyResult() {
  const { store, lastInput } = useCache();
  const { measureAsync } = useProfiler("lazy_result");

  const tokens = useMemo(() => {
    if (!lastInput || !store[lastInput]) return [];
    return store[lastInput].split(" ");
  }, [store, lastInput]);

  // ⚡ Telemetry separate (no re-render side effects inside useMemo)
  useEffect(() => {
    if (!lastInput || !store[lastInput]) return;
    measureAsync(async () => {
      sendEvent("lazy_result_render", {
        hasInput: true,
        tokenCount: tokens.length,
      });
    });
  }, [measureAsync, store, lastInput, tokens.length]);

  return (
    <div className="lazy-result">
      <h3>Rich Visualization</h3>
      <div className="tokens">
        {tokens.length ? (
          tokens.map((t, i) => (
            <span key={i} className="token">
              {t}
            </span>
          ))
        ) : (
          <em>No text to visualize.</em>
        )}
      </div>
    </div>
  );
}
