import { describe, expect, it } from "vitest";
import { TIER_NAMES, tierFor } from "../src/lib/contributions/tiers";
import { DEFAULT_RULES, type MonthlyStats } from "../src/lib/contributions/rules";

const stats = (over: Partial<MonthlyStats> = {}): MonthlyStats => ({
  mergedPrs: 10,
  externalPrs: 5,
  commits: 50,
  newRepos: 1,
  newWorks: 0,
  ...over,
});

describe("tierFor", () => {
  it("returns 0 when the target is not met", () => {
    expect(tierFor("builder", stats({ commits: 49 }), DEFAULT_RULES)).toBe(0);
  });

  it("returns 1 (Riak) exactly at target", () => {
    expect(tierFor("builder", stats(), DEFAULT_RULES)).toBe(1);
  });

  it("returns 2 only when every count metric reaches ceil(target x 1.5)", () => {
    expect(tierFor("builder", stats({ mergedPrs: 15, externalPrs: 8, commits: 75 }), DEFAULT_RULES)).toBe(2);
    expect(tierFor("builder", stats({ mergedPrs: 15, externalPrs: 7, commits: 75 }), DEFAULT_RULES)).toBe(1);
  });

  it("returns 3 at x2 and 4 at x3", () => {
    expect(tierFor("builder", stats({ mergedPrs: 20, externalPrs: 10, commits: 100 }), DEFAULT_RULES)).toBe(3);
    expect(tierFor("builder", stats({ mergedPrs: 30, externalPrs: 15, commits: 150 }), DEFAULT_RULES)).toBe(4);
  });

  it("never asks for a multiplier on new repos or new works", () => {
    expect(tierFor("builder", stats({ mergedPrs: 30, externalPrs: 15, commits: 150, newRepos: 1 }), DEFAULT_RULES)).toBe(4);
    expect(tierFor("creative", stats({ mergedPrs: 30, externalPrs: 15, commits: 0, newRepos: 0, newWorks: 1 }), DEFAULT_RULES)).toBe(4);
  });

  it("judges a creative by pull requests only, not commits", () => {
    expect(tierFor("creative", stats({ mergedPrs: 20, externalPrs: 10, commits: 0, newRepos: 0, newWorks: 1 }), DEFAULT_RULES)).toBe(3);
  });

  it("treats a zero target as satisfied without producing NaN", () => {
    const zero = { ...DEFAULT_RULES, builder: { mergedPrs: 0, externalPrs: 0, commits: 0, newRepos: 0 } };
    const tier = tierFor("builder", stats({ mergedPrs: 0, externalPrs: 0, commits: 0, newRepos: 0 }), zero);
    expect(Number.isInteger(tier)).toBe(true);
    expect(tier).toBeGreaterThanOrEqual(0);
    expect(tier).toBeLessThanOrEqual(4);
  });

  it("names the four tiers", () => {
    expect(TIER_NAMES).toEqual({ 1: "Riak", 2: "Arus", 3: "Pasang", 4: "Samudra" });
  });
});
