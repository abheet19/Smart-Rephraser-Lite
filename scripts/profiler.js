export async function measureAsync(asyncFn) {
    const start = performance.now();
    const result = await asyncFn();
    const end = performance.now();
    return { duration: end - start, result };
  }