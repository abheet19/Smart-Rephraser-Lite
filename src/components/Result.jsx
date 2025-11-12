import React, { useMemo, useEffect } from "react";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";
import { sendEvent } from "../utils/telemetry";

export default function Result() {
  const { store, lastInput } = useCache();
  const { measureAsync } = useProfiler("result");

  const result = useMemo(() => {
    if (!lastInput || !store[lastInput]) return "";
    return store[lastInput];
  }, [store, lastInput]);

  // Telemetry only — async, no re-render
  useEffect(() => {
    measureAsync(async () => {
      sendEvent("result_render", {
        hasInput: !!lastInput,
        fromCache: !!store[lastInput],
        latency: "n/a",
      });
    });
  }, [measureAsync, store, lastInput]);

  return (
    <div className="result">
      <h2>Result</h2>
      <div className="output">{result || "No result yet."}</div>
    </div>
  );
}
