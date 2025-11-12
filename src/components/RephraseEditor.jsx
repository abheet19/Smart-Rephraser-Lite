import React, { useState } from "react";
import { sendEvent, safeHash } from "../utils/telemetry";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";

export default function RephraseEditor() {
  const [text, setText] = useState("");
  const { rephrase, clear } = useCache();
  const { measureAsync } = useProfiler("rephrase");

  const handleRephraseClick = async () => {
    if (!text.trim()) return;
    // measureAsync wraps the rephrase call
    const { duration, result } = await measureAsync(() =>
      rephrase(text.trim()),
    );

    const inputHash = text ? safeHash(text.trim()) : "empty";
    // Send to telemetry
    sendEvent("rephrase_click", {
      fromCache: result.fromCache || false,
      latency: duration.toFixed(2),
      inputHash,
    });
  };

  return (
    <div className="editor">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type something to rephrase..."
      />
      <div className="actions">
        <button onClick={handleRephraseClick}>Rephrase</button>
        <button
          onClick={() => {
            setText("");
          }}
        >
          Clear
        </button>
        <button
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
