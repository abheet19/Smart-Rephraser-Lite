// src/hooks/useProfiler.js
import { useRef } from "react";

export function useProfiler(tag = "profiler") {
  // count is optional; keep a unique id per hook instance
  const idRef = useRef(0);

  // measure an async function
  async function measureAsync(asyncFn) {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    const duration = end - start;
    return { duration, result };
  }

  return { measureAsync };
}