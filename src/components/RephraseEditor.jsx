import React, { useState } from "react";
import { useCache } from "../context/CacheContext";
import { useProfiler } from "../hooks/useProfiler";

export default function RephraseEditor() {
  const [text, setText] = useState("");
  const { rephrase, clear } = useCache();
  const { measureAsync } = useProfiler("rephrase");

  const handleRephraseClick = async () => {
    if (!text.trim()) return;
    // measureAsync wraps the rephrase call
    const { duration, result } = await measureAsync(() => rephrase(text.trim()));
    // rephrase returns { fromCache, result }
    console.log(`Rephrased in ${duration.toFixed(2)}ms`, result);
    // For this component we can set a global result via cache or emit upward via context/useState elsewhere.
    // We'll just log and let Result component read the cache
  };

  return (
    <div className="editor">
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Type something to rephrase..."
      />
      <div className="actions">
        <button onClick={handleRephraseClick}>Rephrase</button>
        <button onClick={() => { setText(""); }}>Clear</button>
        <button onClick={clear}>Reset Cache</button>
      </div>
    </div>
  );
}