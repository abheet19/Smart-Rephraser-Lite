import React, { useState, useEffect } from "react";
import { useCache } from "../context/CacheContext";
import { sendEvent } from "../utils/telemetry";
import { useProfiler } from "../hooks/useProfiler";

export default function LazyResult() {
  const { store, lastInput } = useCache();
  const { measureAsync } = useProfiler("lazy-result");
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    if (!lastInput || !store[lastInput]) {
      setTokens([]);
      return;
    }
    const hasValidInput = lastInput && lastInput.trim().length > 0;
    //  Measure and compute in one step
    measureAsync(async () => {
      const text = store[lastInput];
      const words = text.split(" ");
      const renderedTokens = words.map((t, i) => (
        <span key={i} className="token">{t}</span>
      ));
      setTokens(renderedTokens);
      return words.length; // for telemetry info

    }).then(({ duration, result: wordCount }) => {
      sendEvent("lazy_result_render", {
        hasInput: hasValidInput,
        tokenCount: wordCount,
        latency: duration.toFixed(2),
      });
    });
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