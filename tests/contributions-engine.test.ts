import { describe, expect, it } from "vitest";
import { runContributionSync, type EngineDeps, type EngineMember } from "../src/lib/contributions/engine";
import { DEFAULT_RULES, type ContributionRules, type PullRequestFact } from "../src/lib/contributions/rules";

const NOW = new Date("2026-12-02T10:00:00Z"); // current month 2026-12, evaluates 2026-11
const MONTH = "2026-11-01";

const member = (over: Partial<EngineMember> = {}): EngineMember => ({
  id: "m1",
  githubUsername: "budi",
  fullName: "Budi",
  email: "budi@example.com",
  division: "builder",
  membershipStartedAt: "2026-09-10T00:00:00Z",
  standing: "good",
  ...over,
});

const pr = (repo: string, over: Partial<PullRequestFact> = {}): PullRequestFact => ({
  repo,
  author: "budi",
  mergedAt: "2026-11-10T00:00:00Z",
  commits: 5,
  approvedBy: ["sari"],
  labels: [],
  ...over,
});

/** 10 valid PRs, 5 of them in someone else's repo, 50 commits: meets the builder target with 1 new repo. */
const goodBuilderPrs = () => [...Array.from({ length: 5 }, () => pr("ext")), ...Array.from({ length: 5 }, () => pr("mine"))];
const goodCreativePrs = () => [...Array.from({ length: 5 }, () => pr("ext", { commits: 0 })), ...Array.from({ length: 4 }, () => pr("mine", { commits: 0 })), pr("mine", { commits: 0, labels: ["karya-baru"] })];

function env(options: {
  members: EngineMember[];
  rules?: Partial<ContributionRules>;
  prs?: Record<string, PullRequestFact[]>;
  incomplete?: string[];
  evaluated?: string[];
  throwFor?: string;
}) {
  const calls: string[] = [];
  const saved: { stats: { memberId: string; month: string }[]; evaluations: { memberId: string; month: string; met: boolean; action: string; enforced: boolean }[] } = {
    stats: [],
    evaluations: [],
  };
  const creators: Record<string, string> = { ext: "sari", mine: "budi" };

  const deps: EngineDeps = {
    now: () => NOW,
    loadRules: async () => ({ ...DEFAULT_RULES, ...options.rules }),
    loadMembers: async () => options.members,
    loadRepoCreator: async (repo) => (repo in creators ? { creator: creators[repo], createdAt: null } : null),
    saveRepoCreator: async (repo) => void calls.push(`saveRepoCreator:${repo}`),
    fetchPrs: async (login) => {
      if (options.throwFor === login) throw new Error("boom");
      return { prs: options.prs?.[login] ?? [], complete: !options.incomplete?.includes(login) };
    },
    fetchRepoCreator: async () => ({ creator: null, createdAt: null, ok: false }),
    fetchOrgReposCreatedInMonth: async () => ({ repos: [{ name: "mine", createdAt: "2026-11-05T00:00:00Z" }], ok: true }),
    saveStats: async (memberId, month) => void saved.stats.push({ memberId, month }),
    hasEvaluation: async (memberId, month) => Boolean(options.evaluated?.includes(`${memberId}:${month}`)),
    saveEvaluation: async (row) => {
      calls.push("saveEvaluation");
      saved.evaluations.push(row);
    },
    setStanding: async (id, standing) => void calls.push(`setStanding:${id}:${standing}`),
    kickMember: async (id) => void calls.push(`kickMember:${id}`),
    sendWarning: async (m) => void calls.push(`sendWarning:${m.id}`),
    sendKick: async (m) => void calls.push(`sendKick:${m.id}`),
    alertMaintainers: async (title) => void calls.push(`alert:${title}`),
  };
  return { deps, calls, saved };
}

describe("runContributionSync", () => {
  it("in dry-run mode records the evaluation without touching members or sending anything", async () => {
    const { deps, calls, saved } = env({ members: [member()], prs: { budi: [] } });
    const summary = await runContributionSync(deps);

    expect(summary).toMatchObject({ month: "2026-12-01", dryRun: true, evaluated: 1, warned: 0, kicked: 0 });
    expect(saved.evaluations).toEqual([{ memberId: "m1", month: MONTH, met: false, action: "warn", enforced: false }]);
    expect(calls.filter((call) => !call.startsWith("saveEvaluation") && !call.startsWith("saveRepoCreator"))).toEqual([]);
  });

  it("warns a good member who missed the target (full mode) and saves the evaluation first", async () => {
    const { deps, calls } = env({ members: [member()], rules: { enforcement: "full" }, prs: { budi: [] } });
    const summary = await runContributionSync(deps);

    expect(summary).toMatchObject({ warned: 1, kicked: 0, dryRun: false });
    expect(calls.indexOf("saveEvaluation")).toBeLessThan(calls.indexOf("setStanding:m1:warned"));
    expect(calls).toContain("sendWarning:m1");
  });

  it("kicks a warned member who missed again, with a maintainer alert", async () => {
    const { deps, calls } = env({ members: [member({ standing: "warned" })], rules: { enforcement: "full" }, prs: { budi: [] } });
    const summary = await runContributionSync(deps);

    expect(summary.kicked).toBe(1);
    expect(calls).toEqual(expect.arrayContaining(["kickMember:m1", "sendKick:m1"]));
    expect(calls.some((call) => call.startsWith("alert:"))).toBe(true);
    expect(calls).not.toContain("setStanding:m1:warned");
  });

  it("restores a warned member who met the target", async () => {
    const { deps, calls } = env({ members: [member({ standing: "warned" })], rules: { enforcement: "full" }, prs: { budi: goodBuilderPrs() } });
    const summary = await runContributionSync(deps);

    expect(summary.kicked).toBe(0);
    expect(calls).toContain("setStanding:m1:good");
    expect(calls).not.toContain("kickMember:m1");
  });

  it("never kicks in warn_only mode, but alerts maintainers", async () => {
    const { deps, calls } = env({ members: [member({ standing: "warned" })], rules: { enforcement: "warn_only" }, prs: { budi: [] } });
    const summary = await runContributionSync(deps);

    expect(summary.kicked).toBe(0);
    expect(calls).not.toContain("kickMember:m1");
    expect(calls).not.toContain("sendKick:m1");
    expect(calls.some((call) => call.startsWith("alert:"))).toBe(true);
  });

  it("does not evaluate the same member and month twice", async () => {
    const { deps, saved } = env({ members: [member()], rules: { enforcement: "full" }, prs: { budi: [] }, evaluated: [`m1:${MONTH}`] });
    const summary = await runContributionSync(deps);
    expect(saved.evaluations).toEqual([]);
    expect(summary.evaluated).toBe(0);
  });

  it("gives members a grace period for the month they were approved in", async () => {
    const { deps, saved } = env({ members: [member({ membershipStartedAt: "2026-11-20T00:00:00Z" })], rules: { enforcement: "full" }, prs: { budi: [] } });
    await runContributionSync(deps);
    expect(saved.evaluations).toEqual([]);
  });

  it("defers instead of punishing when GitHub data is incomplete", async () => {
    const { deps, calls, saved } = env({ members: [member()], rules: { enforcement: "full" }, prs: { budi: [] }, incomplete: ["budi"] });
    const summary = await runContributionSync(deps);

    expect(summary.deferred).toBe(1);
    expect(saved.evaluations).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("keeps going when one member fails", async () => {
    const { deps, saved } = env({
      members: [member({ id: "m1", githubUsername: "broken" }), member({ id: "m2", githubUsername: "budi" })],
      rules: { enforcement: "full" },
      prs: { budi: goodBuilderPrs() },
      throwFor: "broken",
    });
    const summary = await runContributionSync(deps);

    expect(summary.deferred).toBe(1);
    expect(saved.evaluations.map((row) => row.memberId)).toEqual(["m2"]);
  });

  it("skips members without a GitHub username", async () => {
    const { deps, saved } = env({ members: [member({ githubUsername: "" })], rules: { enforcement: "full" } });
    const summary = await runContributionSync(deps);
    expect(summary.skipped).toBe(1);
    expect(saved.evaluations).toEqual([]);
  });

  it("only syncs statistics when evaluation is turned off", async () => {
    const { deps, saved, calls } = env({ members: [member()], rules: { enforcement: "full" }, prs: { budi: goodBuilderPrs() } });
    const summary = await runContributionSync(deps, { evaluate: false });

    expect(summary.synced).toBe(1);
    expect(saved.stats.map((row) => row.month).sort()).toEqual(["2026-11-01", "2026-12-01"]);
    expect(saved.evaluations).toEqual([]);
    expect(calls).toEqual([]);
  });

  it("does not ask creatives for commits or a new repo", async () => {
    const { deps, saved } = env({ members: [member({ division: "creative" })], rules: { enforcement: "full" }, prs: { budi: goodCreativePrs() } });
    await runContributionSync(deps);
    expect(saved.evaluations).toEqual([{ memberId: "m1", month: MONTH, met: true, action: "none", enforced: true }]);
  });
});
