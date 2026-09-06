import { describe, it, expect } from "vitest";
import { rephrase } from "./api";
import {
  paraphrase,
  stripFillerWords,
  contractOrExpand,
  substituteSynonyms,
  reorderClause,
} from "./paraphrase";

describe("paraphrase", () => {
  it("substitutes synonyms while preserving sentence case", () => {
    expect(paraphrase("The quick fox is happy.")).toBe(
      "The speedy fox is joyful.",
    );
  });

  it("expands contractions", () => {
    expect(paraphrase("I don't know.")).toBe("I do not understand.");
  });

  it("contracts formal phrasing when no contraction is present", () => {
    expect(paraphrase("I do not know.")).toBe("I don't understand.");
  });

  it("trims filler words", () => {
    expect(stripFillerWords("I basically just really want this")).toBe(
      "I want this",
    );
  });

  it("reorders a leading subordinate clause", () => {
    expect(paraphrase("Although it was raining, we went out.")).toBe(
      "We went out although it was raining.",
    );
  });

  it("leaves unrecognized words untouched", () => {
    expect(substituteSynonyms("Zorblax gleeps")).toBe("Zorblax gleeps");
  });

  it("returns the input unchanged when there is no comma to reorder on", () => {
    expect(reorderClause("Because reasons")).toBe("Because reasons");
  });

  it("handles empty input", () => {
    expect(paraphrase("")).toBe("");
    expect(paraphrase("   ")).toBe("");
  });

  it("round-trips contractions back to contracted form", () => {
    expect(contractOrExpand("do not")).toBe("don't");
    expect(contractOrExpand("don't")).toBe("do not");
  });
});

describe("rephrase (api)", () => {
  it("resolves with the paraphrased result", async () => {
    const out = await rephrase("quick happy");
    expect(out).toBe("Speedy joyful");
  });
});
