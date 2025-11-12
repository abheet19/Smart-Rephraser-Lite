export function useProfiler() {
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
