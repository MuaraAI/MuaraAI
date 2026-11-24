import {
  isGraceMonth,
  meetsTarget,
  monthStart,
  nextStanding,
  previousMonth,
  summarizeMonth,
  type ContributionRules,
  type Division,
  type MonthlyStats,
  type Standing,
} from "./rules";
import { tierFor, type Tier } from "./tiers";
import type { fetchMergedPrs, fetchOrgReposCreatedInMonth, fetchRepoCreator } from "./github";

export interface EngineMember {
  id: string;
  githubUsername: string;
  fullName: string;
  email: string | null;
  division: Division;
  membershipStartedAt: string | null;
  standing: Standing;
  /** Consecutive evaluated months in which the target was met (as of the last evaluation). */
  streak: number;
}

type EvaluationAction = "none" | "warn" | "kick" | "recover";

export interface EngineDeps {
  now: () => Date;
  loadRules(): Promise<ContributionRules>;
  loadMembers(): Promise<EngineMember[]>;
  loadRepoCreator(repo: string): Promise<{ creator: string | null; createdAt: string | null } | null>;
  saveRepoCreator(repo: string, creator: string | null, createdAt: string | null): Promise<void>;
  fetchPrs(login: string, month: string, org: string): ReturnType<typeof fetchMergedPrs>;
  fetchRepoCreator(repo: string, org: string): ReturnType<typeof fetchRepoCreator>;
  fetchOrgReposCreatedInMonth(org: string, month: string): ReturnType<typeof fetchOrgReposCreatedInMonth>;
  saveStats(memberId: string, month: string, stats: MonthlyStats): Promise<void>;
  hasEvaluation(memberId: string, month: string): Promise<boolean>;
  /** Resolves true only when this call inserted the row (false when a concurrent run already did). */
  saveEvaluation(row: { memberId: string; month: string; met: boolean; action: EvaluationAction; enforced: boolean }): Promise<boolean>;
  /** "missing" = GitHub confirms the account does not exist, "error" = could not tell. */
  verifyLogin(login: string): Promise<"ok" | "missing" | "error">;
  saveTier(memberId: string, tier: Tier, streak: number): Promise<void>;
  setStanding(memberId: string, standing: Standing): Promise<void>;
  kickMember(memberId: string, reason: string): Promise<void>;
  sendWarning(member: EngineMember, month: string, stats: MonthlyStats): Promise<void>;
  sendKick(member: EngineMember, month: string): Promise<void>;
  alertMaintainers(title: string, text: string): Promise<void>;
}

export interface SyncSummary {
  month: string;
  synced: number;
  skipped: number;
  evaluated: number;
  warned: number;
  kicked: number;
  deferred: number;
  dryRun: boolean;
  /** True when the time budget ran out before every member was processed. */
  partial: boolean;
}

const DEFAULT_BUDGET_MS = 45_000;

/**
 * Syncs this month's and last month's statistics for every active member and, unless turned off,
 * evaluates last month once per member. The evaluation row is written BEFORE any action so a
 * failing action can never be retried into a harsher one (a failed warning email must not turn
 * into a kick on the next run). Incomplete GitHub data defers the evaluation instead of failing it.
 */
export async function runContributionSync(
  deps: EngineDeps,
  options: { evaluate?: boolean; budgetMs?: number } = {}
): Promise<SyncSummary> {
  const rules = await deps.loadRules();
  const members = await deps.loadMembers();
  const startedAt = deps.now();
  const budgetMs = options.budgetMs ?? DEFAULT_BUDGET_MS;
  const currentMonth = monthStart(startedAt);
  const lastMonth = previousMonth(currentMonth);
  const summary: SyncSummary = {
    month: currentMonth,
    synced: 0,
    skipped: 0,
    evaluated: 0,
    warned: 0,
    kicked: 0,
    deferred: 0,
    dryRun: rules.enforcement === "dry_run",
    partial: false,
  };

  const creatorCache = new Map<string, { creator: string | null; ok: boolean }>();
  const creatorOf = async (repo: string): Promise<{ creator: string | null; ok: boolean }> => {
    const known = creatorCache.get(repo);
    if (known) return known;
    let result: { creator: string | null; ok: boolean } = { creator: null, ok: false };
    const cached = await deps.loadRepoCreator(repo);
    if (cached) {
      result = { creator: cached.creator, ok: true };
    } else {
      const fetched = await deps.fetchRepoCreator(repo, rules.org);
      if (fetched.ok) {
        await deps.saveRepoCreator(repo, fetched.creator, fetched.createdAt);
        result = { creator: fetched.creator, ok: true };
      }
    }
    creatorCache.set(repo, result);
    return result;
  };

  const orgRepos = new Map<string, ReturnType<typeof fetchOrgReposCreatedInMonth>>();
  const reposCreatedIn = (month: string) => {
    if (!orgRepos.has(month)) orgRepos.set(month, deps.fetchOrgReposCreatedInMonth(rules.org, month));
    return orgRepos.get(month)!;
  };

  const computeStats = async (member: EngineMember, month: string): Promise<{ stats: MonthlyStats; complete: boolean }> => {
    const { prs, complete } = await deps.fetchPrs(member.githubUsername, month, rules.org);

    const repoCreators: Record<string, string | null> = {};
    // An unknown creator of a repo someone merged into counts as "external" (never hurts the member).
    for (const repo of new Set(prs.map((pr) => pr.repo))) repoCreators[repo] = (await creatorOf(repo)).creator;

    let owned = 0;
    let reposComplete = true;
    if (member.division === "builder") {
      const created = await reposCreatedIn(month);
      reposComplete = created.ok;
      for (const repo of created.repos) {
        // An unknown creator of a NEW repo would undercount "repos created", so the data is incomplete.
        const { creator, ok } = await creatorOf(repo.name);
        if (!ok) reposComplete = false;
        if (creator && creator.toLowerCase() === member.githubUsername.toLowerCase()) owned += 1;
      }
    }

    return {
      stats: summarizeMonth({
        login: member.githubUsername,
        prs,
        repoCreators,
        ownedReposCreatedInMonth: owned,
        newWorkLabel: rules.newWorkLabel,
      }),
      complete: complete && reposComplete,
    };
  };

  // Rotate the starting member by day so a budget cut never starves the same members every run.
  const offset = members.length > 0 ? startedAt.getUTCDate() % members.length : 0;
  const ordered = [...members.slice(offset), ...members.slice(0, offset)];
  const missingLogins: string[] = [];

  for (const [index, member] of ordered.entries()) {
    if (index > 0 && deps.now().getTime() - startedAt.getTime() > budgetMs) {
      summary.partial = true;
      break;
    }
    if (!member.githubUsername) {
      summary.skipped += 1;
      continue;
    }

    try {
      // A wrong or renamed username would look like "0 PRs": confirm the account exists first.
      const login = await deps.verifyLogin(member.githubUsername);
      if (login !== "ok") {
        if (login === "missing") missingLogins.push(member.githubUsername);
        summary.deferred += 1;
        continue;
      }

      const current = await computeStats(member, currentMonth);
      if (current.complete) {
        await deps.saveStats(member.id, currentMonth, current.stats);
        summary.synced += 1;
      }

      const previous = await computeStats(member, lastMonth);
      if (previous.complete) await deps.saveStats(member.id, lastMonth, previous.stats);

      if (options.evaluate === false) continue;
      if (isGraceMonth(lastMonth, member.membershipStartedAt)) continue;
      if (await deps.hasEvaluation(member.id, lastMonth)) continue;
      if (!previous.complete) {
        summary.deferred += 1;
        continue;
      }

      const met = meetsTarget(member.division, previous.stats, rules);
      const { action } = nextStanding(member.standing, met);
      // warn_only never removes anyone, so a would-be kick is recorded as not enforced.
      const enforced = rules.enforcement === "full" || (rules.enforcement === "warn_only" && action !== "kick");

      // Only the run that actually inserted the row may act (a concurrent run must not double-send).
      const inserted = await deps.saveEvaluation({ memberId: member.id, month: lastMonth, met, action, enforced });
      if (!inserted) continue;
      summary.evaluated += 1;

      // Recognition is harmless to record in every mode (including dry_run).
      await deps.saveTier(member.id, met ? tierFor(member.division, previous.stats, rules) : 0, met ? member.streak + 1 : 0);
      if (rules.enforcement === "dry_run") continue;

      if (action === "warn") {
        await deps.setStanding(member.id, "warned");
        await deps.sendWarning(member, lastMonth, previous.stats);
        summary.warned += 1;
      } else if (action === "recover") {
        await deps.setStanding(member.id, "good");
      } else if (action === "kick") {
        // Maintainer alerts may reach a shared channel: identify by public username only.
        const name = `@${member.githubUsername}`;
        if (rules.enforcement === "full") {
          await deps.kickMember(
            member.id,
            `Dikeluarkan otomatis: target kontribusi tidak terpenuhi dua bulan berturut-turut (sampai ${lastMonth.slice(0, 7)}).`
          );
          await deps.sendKick(member, lastMonth);
          await deps.alertMaintainers(
            "Anggota dikeluarkan karena kontribusi",
            `${name} dikeluarkan setelah dua bulan berturut-turut tidak memenuhi target (sampai ${lastMonth.slice(0, 7)}). Cabut keanggotaan org GitHub secara manual bila perlu.`
          );
          summary.kicked += 1;
        } else {
          await deps.alertMaintainers(
            "Anggota memenuhi syarat dikeluarkan (mode warn_only)",
            `${name} tidak memenuhi target dua bulan berturut-turut (sampai ${lastMonth.slice(0, 7)}). Tidak ada tindakan otomatis di mode warn_only.`
          );
        }
      }
    } catch (error) {
      console.error("[contributions] member failed", member.id, error instanceof Error ? error.message : "unknown");
      summary.deferred += 1;
    }
  }

  if (missingLogins.length > 0) {
    await deps.alertMaintainers(
      "Username GitHub tidak ditemukan",
      `Periksa username anggota berikut, evaluasi mereka ditunda: ${missingLogins.map((login) => `@${login}`).join(", ")}.`
    );
  }

  return summary;
}
