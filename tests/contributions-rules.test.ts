import { describe, expect, it } from "vitest";
import {
  DEFAULT_RULES,
  isGraceMonth,
  meetsTarget,
  monthStart,
  nextMonth,
  nextStanding,
  parseRules,
  previousMonth,
  serializeRules,
  summarizeMonth,
  type MonthlyStats,
  type PullRequestFact,
} from "../src/lib/contributions/rules";

const pr = (over: Partial<PullRequestFact> = {}): PullRequestFact => ({
  repo: "site",
  author: "budi",
  mergedAt: "2026-11-10T00:00:00Z",
  commits: 3,
  approvedBy: ["sari"],
  labels: [],
  ...over,
});

const stats = (over: Partial<MonthlyStats> = {}): MonthlyStats => ({
  mergedPrs: 0,
  externalPrs: 0,
  commits: 0,
  newRepos: 0,
  newWorks: 0,
  ...over,
});

describe("parseRules / serializeRules", () => {
  it("falls back to the defaults for missing or invalid input", () => {
    expect(parseRules(null)).toEqual(DEFAULT_RULES);
    expect(parseRules("nope")).toEqual(DEFAULT_RULES);
    expect(DEFAULT_RULES.enforcement).toBe("dry_run");
    expect(DEFAULT_RULES.builder).toEqual({ mergedPrs: 10, externalPrs: 5, commits: 50, newRepos: 1 });
    expect(DEFAULT_RULES.creative).toEqual({ mergedPrs: 10, externalPrs: 5, newWorks: 1 });
  });

  it("reads the snake_case setting and repairs bad fields one by one", () => {
    const parsed = parseRules({
      enforcement: "yolo",
      org: "Other",
      new_work_label: "karya",
      builder: { merged_prs: -3, commits: "many", external_prs: 7 },
      creative: { new_works: 2 },
    });
    expect(parsed.enforcement).toBe("dry_run");
    expect(parsed.org).toBe("Other");
    expect(parsed.newWorkLabel).toBe("karya");
    expect(parsed.builder).toEqual({ mergedPrs: 10, externalPrs: 7, commits: 50, newRepos: 1 });
    expect(parsed.creative).toEqual({ mergedPrs: 10, externalPrs: 5, newWorks: 2 });
    expect(parseRules({ enforcement: "full" }).enforcement).toBe("full");
    expect(parseRules({ enforcement: "warn_only" }).enforcement).toBe("warn_only");
  });

  it("round-trips through serializeRules", () => {
    const rules = { ...DEFAULT_RULES, enforcement: "warn_only" as const, builder: { ...DEFAULT_RULES.builder, mergedPrs: 8 } };
    expect(parseRules(serializeRules(rules))).toEqual(rules);
    expect(serializeRules(rules)).toMatchObject({ new_work_label: "karya-baru", builder: { merged_prs: 8 } });
  });
});

describe("month helpers", () => {
  it("uses UTC month boundaries", () => {
    expect(monthStart(new Date("2026-11-30T23:59:59Z"))).toBe("2026-11-01");
    expect(monthStart(new Date("2026-12-01T00:00:00Z"))).toBe("2026-12-01");
    expect(previousMonth("2026-01-01")).toBe("2025-12-01");
    expect(previousMonth("2026-11-01")).toBe("2026-10-01");
    expect(nextMonth("2026-12-01")).toBe("2027-01-01");
  });

  it("treats the approval month and earlier as grace, and missing start dates as grace", () => {
    expect(isGraceMonth("2026-11-01", "2026-11-15T00:00:00Z")).toBe(true);
    expect(isGraceMonth("2026-10-01", "2026-11-15T00:00:00Z")).toBe(true);
    expect(isGraceMonth("2026-12-01", "2026-11-15T00:00:00Z")).toBe(false);
    expect(isGraceMonth("2026-12-01", null)).toBe(true);
  });
});

describe("summarizeMonth", () => {
  const base = { login: "budi", ownedReposCreatedInMonth: 0, newWorkLabel: "karya-baru" };

  it("counts only PRs approved by someone else and sums their commits", () => {
    const result = summarizeMonth({
      ...base,
      prs: [pr(), pr({ approvedBy: ["budi"] }), pr({ approvedBy: [] }), pr({ approvedBy: ["BUDI"] }), pr({ commits: 5 })],
      repoCreators: { site: "sari" },
    });
    expect(result.mergedPrs).toBe(2);
    expect(result.commits).toBe(8);
  });

  it("does not count PRs in repos the member created as external", () => {
    const result = summarizeMonth({
      ...base,
      prs: [pr({ repo: "site" }), pr({ repo: "own" }), pr({ repo: "Own" }), pr({ repo: "unknown" })],
      repoCreators: { site: "sari", own: "Budi", Own: "budi", unknown: null },
    });
    expect(result.mergedPrs).toBe(4);
    expect(result.externalPrs).toBe(2);
  });

  it("treats a repo with no known creator as external", () => {
    const result = summarizeMonth({ ...base, prs: [pr({ repo: "mystery" })], repoCreators: {} });
    expect(result.externalPrs).toBe(1);
  });

  it("counts new works by label (case-insensitive) on valid PRs only and passes through new repos", () => {
    const result = summarizeMonth({
      ...base,
      ownedReposCreatedInMonth: 2,
      prs: [pr({ labels: ["Karya-Baru"] }), pr({ labels: ["karya-baru"], approvedBy: [] }), pr({ labels: ["bug"] })],
      repoCreators: { site: "sari" },
    });
    expect(result.newWorks).toBe(1);
    expect(result.newRepos).toBe(2);
  });
});

describe("meetsTarget", () => {
  const builderFull = stats({ mergedPrs: 10, externalPrs: 5, commits: 50, newRepos: 1 });
  const creativeFull = stats({ mergedPrs: 10, externalPrs: 5, newWorks: 1 });

  it("passes a builder exactly at the limits and fails when any metric is short", () => {
    expect(meetsTarget("builder", builderFull, DEFAULT_RULES)).toBe(true);
    for (const key of ["mergedPrs", "externalPrs", "commits", "newRepos"] as const) {
      expect(meetsTarget("builder", { ...builderFull, [key]: builderFull[key] - 1 }, DEFAULT_RULES)).toBe(false);
    }
  });

  it("does not ask creatives for commits or new repos, but needs a new work", () => {
    expect(meetsTarget("creative", creativeFull, DEFAULT_RULES)).toBe(true);
    expect(meetsTarget("creative", { ...creativeFull, newWorks: 0 }, DEFAULT_RULES)).toBe(false);
    expect(meetsTarget("creative", { ...creativeFull, externalPrs: 4 }, DEFAULT_RULES)).toBe(false);
    expect(meetsTarget("creative", { ...creativeFull, mergedPrs: 9 }, DEFAULT_RULES)).toBe(false);
  });
});

describe("nextStanding", () => {
  it("warns first, kicks on a consecutive miss, and recovers after a good month", () => {
    expect(nextStanding("good", true)).toEqual({ standing: "good", action: "none" });
    expect(nextStanding("good", false)).toEqual({ standing: "warned", action: "warn" });
    expect(nextStanding("warned", true)).toEqual({ standing: "good", action: "recover" });
    expect(nextStanding("warned", false)).toEqual({ standing: "warned", action: "kick" });
  });
});
