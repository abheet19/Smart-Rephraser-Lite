// src/components/Result.jsx
import React, { useState, useEffect } from "react";
import { useCache } from "../context/CacheContext";

export default function Result() {
    const { store, lastInput } = useCache();
    const [result, setResult] = useState("");

    useEffect(() => {
        if (!lastInput) { setResult(""); return; }
        setResult(store[lastInput] || "");
    }, [store, lastInput]);

    return (
        <div className="result">
            <h2>Result</h2>
            <div className="output">{result || "No result yet."}</div>
        </div>
    );
}