import React, { useMemo, useEffect, useState } from "react";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";
import { sendEvent } from "../utils/telemetry";

export default function Result() {
  const { store, lastInput } = useCache();
  const { measureAsync } = useProfiler("result");
  // Track *which* result string was last copied rather than a plain boolean,
  // so the "Copied" confirmation naturally clears itself when the result
  // changes underneath it -- no effect required to reset it.
  const [copiedResult, setCopiedResult] = useState(null);

  const result = useMemo(() => {
    if (!lastInput || !store[lastInput]) return "";
    return store[lastInput];
  }, [store, lastInput]);

  const copied = result !== "" && copiedResult === result;

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopiedResult(result);
      sendEvent("result_copy", { length: result.length });
      setTimeout(() => setCopiedResult(null), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="result glass-card">
      <div className="result-header">
        <h2>Result</h2>
        {result && (
          <button
            className="btn btn-secondary btn-copy"
            onClick={handleCopy}
            type="button"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        )}
      </div>
      <div className={`output${result ? "" : " output-empty"}`}>
        {result || "No result yet."}
      </div>
      {copied && (
        <div className="toast" role="status">
          Copied to clipboard
        </div>
      )}
    </div>
  );
}
