import React, { useState } from "react";
import { sendEvent, safeHash } from "../utils/telemetry";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";

export default function RephraseEditor() {
  const [text, setText] = useState("");
  const [isRephrasing, setIsRephrasing] = useState(false);
  const { rephrase, clear } = useCache();
  const { measureAsync } = useProfiler("rephrase");

  const trimmed = text.trim();
  const wordCount = trimmed ? trimmed.split(/\s+/).length : 0;
  const charCount = text.length;
  const canRephrase = trimmed.length > 0 && !isRephrasing;

  const handleRephraseClick = async () => {
    if (!trimmed) return;
    setIsRephrasing(true);
    try {
      // measureAsync wraps the rephrase call
      const { duration, result: resp } = await measureAsync(() =>
        rephrase(trimmed),
      );

      const inputHash = safeHash(trimmed);
      // Send to telemetry
      sendEvent("rephrase_click", {
        fromCache: resp.fromCache || false,
        latency: duration.toFixed(2),
        inputHash,
      });
    } finally {
      setIsRephrasing(false);
    }
  };

  return (
    <div className="editor glass-card">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to rephrase..."
      />
      <div className="counter" aria-live="polite">
        {charCount} {charCount === 1 ? "character" : "characters"} · {wordCount}{" "}
        {wordCount === 1 ? "word" : "words"}
      </div>
      <div className="actions">
        <button
          className="btn btn-primary"
          onClick={handleRephraseClick}
          disabled={!canRephrase}
          aria-busy={isRephrasing}
        >
          {isRephrasing ? (
            <>
              <span className="spinner" aria-hidden="true" />
              Rephrasing…
            </>
          ) : (
            "Rephrase"
          )}
        </button>
        <button
          className="btn btn-secondary"
          onClick={() => {
            setText("");
          }}
        >
          Clear
        </button>
        <button
          className="btn btn-secondary btn-danger"
          onClick={() => {
            setText(""); // clear input field
            clear(); // clear global cache and result
          }}
        >
          Reset Cache
        </button>
      </div>
    </div>
  );
}
