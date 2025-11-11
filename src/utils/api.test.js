import { describe, it, expect } from "vitest";
import { fakeAIRephrase } from "./api";

describe("fakeAIRephrase", () => {
  it("substitutes synonyms and reverses", () => {
    const input = "quick happy";
    const out = fakeAIRephrase(input);
    expect(out).toBe("joyful speedy");
  });
})