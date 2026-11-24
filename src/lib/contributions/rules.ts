export type Division = "builder" | "creative";
export type Enforcement = "dry_run" | "warn_only" | "full";
export type Standing = "good" | "warned";

export interface ContributionRules {
  enforcement: Enforcement;
  org: string;
  newWorkLabel: string;
  builder: { mergedPrs: number; externalPrs: number; commits: number; newRepos: number };
  creative: { mergedPrs: number; externalPrs: number; newWorks: number };
}

export interface PullRequestFact {
  repo: string;
  author: string;
  mergedAt: string;
  commits: number;
  approvedBy: string[];
  labels: string[];
}

export interface MonthlyStats {
  mergedPrs: number;
  externalPrs: number;
  commits: number;
  newRepos: number;
  newWorks: number;
}

export const DEFAULT_RULES: ContributionRules = {
  enforcement: "dry_run",
  org: "MuaraAI",
  newWorkLabel: "karya-baru",
  builder: { mergedPrs: 10, externalPrs: 5, commits: 50, newRepos: 1 },
  creative: { mergedPrs: 10, externalPrs: 5, newWorks: 1 },
};

const ENFORCEMENTS: readonly Enforcement[] = ["dry_run", "warn_only", "full"];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const count = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : fallback;
const text = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim() ? value.trim() : fallback;

/** Reads the snake_case `contribution_rules` setting; every invalid field falls back to its default. */
export function parseRules(value: unknown): ContributionRules {
  const root = isRecord(value) ? value : {};
  const builder = isRecord(root.builder) ? root.builder : {};
  const creative = isRecord(root.creative) ? root.creative : {};
  const d = DEFAULT_RULES;

  return {
    enforcement: ENFORCEMENTS.includes(root.enforcement as Enforcement) ? (root.enforcement as Enforcement) : "dry_run",
    org: text(root.org, d.org),
    newWorkLabel: text(root.new_work_label, d.newWorkLabel),
    builder: {
      mergedPrs: count(builder.merged_prs, d.builder.mergedPrs),
      externalPrs: count(builder.external_prs, d.builder.externalPrs),
      commits: count(builder.commits, d.builder.commits),
      newRepos: count(builder.new_repos, d.builder.newRepos),
    },
    creative: {
      mergedPrs: count(creative.merged_prs, d.creative.mergedPrs),
      externalPrs: count(creative.external_prs, d.creative.externalPrs),
      newWorks: count(creative.new_works, d.creative.newWorks),
    },
  };
}

/** The shape stored in `community_settings` (snake_case). */
export function serializeRules(rules: ContributionRules): Record<string, unknown> {
  return {
    enforcement: rules.enforcement,
    org: rules.org,
    new_work_label: rules.newWorkLabel,
    builder: {
      merged_prs: rules.builder.mergedPrs,
      external_prs: rules.builder.externalPrs,
      commits: rules.builder.commits,
      new_repos: rules.builder.newRepos,
    },
    creative: {
      merged_prs: rules.creative.mergedPrs,
      external_prs: rules.creative.externalPrs,
      new_works: rules.creative.newWorks,
    },
  };
}

const pad = (value: number) => String(value).padStart(2, "0");

/** First day of the UTC month of `date`, as YYYY-MM-01. */
export function monthStart(date: Date): string {
  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-01`;
}

function shiftMonth(month: string, delta: number): string {
  const [year, monthNumber] = month.split("-").map(Number);
  return monthStart(new Date(Date.UTC(year, monthNumber - 1 + delta, 1)));
}

export const previousMonth = (month: string): string => shiftMonth(month, -1);
export const nextMonth = (month: string): string => shiftMonth(month, 1);

/** "2026-11-01" -> "November 2026" (UTC, Indonesian). */
export function monthLabel(month: string): string {
  return new Date(`${month}T00:00:00Z`).toLocaleDateString("id-ID", { month: "long", year: "numeric", timeZone: "UTC" });
}

/** A member is not evaluated for the month they were approved in, nor before it. */
export function isGraceMonth(month: string, membershipStartedAt: string | null): boolean {
  if (!membershipStartedAt) return true;
  const started = new Date(membershipStartedAt);
  if (Number.isNaN(started.getTime())) return true;
  return month <= monthStart(started);
}

export function summarizeMonth(input: {
  login: string;
  prs: PullRequestFact[];
  repoCreators: Record<string, string | null>;
  ownedReposCreatedInMonth: number;
  newWorkLabel: string;
}): MonthlyStats {
  const login = input.login.toLowerCase();
  const label = input.newWorkLabel.toLowerCase();
  const valid = input.prs.filter((pr) => pr.approvedBy.some((approver) => approver.toLowerCase() !== login));

  return {
    mergedPrs: valid.length,
    externalPrs: valid.filter((pr) => {
      const creator = input.repoCreators[pr.repo];
      return !creator || creator.toLowerCase() !== login;
    }).length,
    commits: valid.reduce((total, pr) => total + pr.commits, 0),
    newRepos: input.ownedReposCreatedInMonth,
    newWorks: valid.filter((pr) => pr.labels.some((name) => name.toLowerCase() === label)).length,
  };
}

export function meetsTarget(division: Division, stats: MonthlyStats, rules: ContributionRules): boolean {
  if (division === "builder") {
    const target = rules.builder;
    return (
      stats.mergedPrs >= target.mergedPrs &&
      stats.externalPrs >= target.externalPrs &&
      stats.commits >= target.commits &&
      stats.newRepos >= target.newRepos
    );
  }
  const target = rules.creative;
  return (
    stats.mergedPrs >= target.mergedPrs &&
    stats.externalPrs >= target.externalPrs &&
    stats.newWorks >= target.newWorks
  );
}

export function nextStanding(
  previous: Standing,
  met: boolean
): { standing: Standing; action: "none" | "warn" | "kick" | "recover" } {
  if (previous === "good") return met ? { standing: "good", action: "none" } : { standing: "warned", action: "warn" };
  return met ? { standing: "good", action: "recover" } : { standing: "warned", action: "kick" };
}
