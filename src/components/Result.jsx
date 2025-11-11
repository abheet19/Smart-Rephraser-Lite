// src/components/Result.jsx
import React, { useState, useEffect } from "react";
import { useCache } from "../context/CacheContext";
import { sendEvent } from "../utils/telemetry";
import { useProfiler } from "../hooks/useProfiler";

export default function Result() {
    const { store, lastInput } = useCache();
    const [result, setResult] = useState("");
    const { measureAsync } = useProfiler("result");
    useEffect(() => {

        // Only run profiling + telemetry if there’s a valid last input
        const isCacheEmpty = !store || Object.keys(store).length === 0;
        if (!lastInput || isCacheEmpty) { // clear everything
            setResult("");
            return;
        }
        const hasValidInput = lastInput && lastInput.trim().length > 0;

        async function loadResult() {
            const { result, duration } = await measureAsync(async () => {
                if (!lastInput) {
                    setResult("");
                    return;
                }
                setResult(store[lastInput] || "");
            });
            // send telemetry about rendering and cache hit/miss
            sendEvent("result_render", {
                hasInput: hasValidInput,
                latency: duration.toFixed(2),
            });
        }
        loadResult();

    }, [store, lastInput]);

    return (
        <div className="result">
            <h2>Result</h2>
            <div className="output">{result || "No result yet."}</div>
        </div>
    );
}