import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_RULES, serializeRules, type ContributionRules } from "../src/lib/contributions/rules";

const upsertMock = vi.fn();
const runMock = vi.fn();
let hierarchy = "maintainer";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: (table: string) =>
      table === "members"
        ? { select: () => ({ eq: () => ({ single: async () => ({ data: { id: "u1", hierarchy, roles: [] } }) }) }) }
        : { upsert: upsertMock },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({ createPrivilegedClient: async () => ({ privileged: true }) }));
vi.mock("@/lib/contributions/supabase-deps", () => ({ buildSupabaseDeps: () => ({ deps: true }) }));
vi.mock("@/lib/contributions/engine", () => ({ runContributionSync: (...args: unknown[]) => runMock(...args) }));

import { syncContributionsNow, updateContributionRules } from "../src/app/actions/admin";

const rules = (over: Partial<ContributionRules> = {}): ContributionRules => ({ ...DEFAULT_RULES, ...over });

beforeEach(() => {
  hierarchy = "maintainer";
  upsertMock.mockReset().mockResolvedValue({ error: null });
  runMock.mockReset().mockResolvedValue({ month: "2026-12-01", synced: 3, skipped: 1, evaluated: 0, warned: 0, kicked: 0, deferred: 0, dryRun: true });
});

describe("updateContributionRules", () => {
  it("saves valid rules in the snake_case setting shape", async () => {
    const next = rules({ enforcement: "warn_only", builder: { ...DEFAULT_RULES.builder, mergedPrs: 12 } });
    const result = await updateContributionRules(next);

    expect(result).toEqual({ success: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({ key: "contribution_rules", value: serializeRules(next) }),
      { onConflict: "key" }
    );
  });

  it("rejects non-maintainers", async () => {
    hierarchy = "member";
    await expect(updateContributionRules(rules())).rejects.toThrow("Forbidden");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rejects an unknown enforcement mode, out-of-range numbers, and odd names", async () => {
    expect((await updateContributionRules(rules({ enforcement: "yolo" as never }))).success).toBe(false);
    expect((await updateContributionRules(rules({ builder: { ...DEFAULT_RULES.builder, commits: 1001 } }))).success).toBe(false);
    expect((await updateContributionRules(rules({ builder: { ...DEFAULT_RULES.builder, commits: -1 } }))).success).toBe(false);
    expect((await updateContributionRules(rules({ creative: { ...DEFAULT_RULES.creative, newWorks: 1.5 } }))).success).toBe(false);
    expect((await updateContributionRules(rules({ org: "Mu/ara" }))).success).toBe(false);
    expect((await updateContributionRules(rules({ newWorkLabel: "" }))).success).toBe(false);
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rejects tier multipliers that are not strictly increasing, above 1, and at most 10", async () => {
    for (const tierMultipliers of [
      { arus: 3, pasang: 2, samudra: 4 },
      { arus: 1, pasang: 2, samudra: 3 },
      { arus: 1.5, pasang: 2, samudra: 11 },
      { arus: Number.NaN, pasang: 2, samudra: 3 },
      { arus: "2" as unknown as number, pasang: 3, samudra: 4 },
    ]) {
      const result = await updateContributionRules(rules({ tierMultipliers }));
      expect(result).toEqual({ success: false, error: "Pengali tier harus naik berurutan (lebih dari 1, maksimal 10)." });
    }
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("saves valid multipliers in the setting", async () => {
    const tierMultipliers = { arus: 2, pasang: 3, samudra: 5 };
    expect(await updateContributionRules(rules({ tierMultipliers }))).toEqual({ success: true });
    expect(upsertMock.mock.calls[0][0].value.tier_multipliers).toEqual(tierMultipliers);
  });

  it("hides raw database errors", async () => {
    upsertMock.mockResolvedValue({ error: { message: "relation x does not exist" } });
    const result = await updateContributionRules(rules());
    expect(result).toEqual({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
  });
});

describe("syncContributionsNow", () => {
  it("syncs statistics without evaluating or punishing anyone", async () => {
    const result = await syncContributionsNow();

    expect(result).toEqual({ success: true, summary: { synced: 3, skipped: 1 } });
    expect(runMock).toHaveBeenCalledWith({ deps: true }, { evaluate: false });
  });

  it("rejects non-maintainers", async () => {
    hierarchy = "member";
    await expect(syncContributionsNow()).rejects.toThrow("Forbidden");
    expect(runMock).not.toHaveBeenCalled();
  });

  it("returns a generic error when the engine fails", async () => {
    runMock.mockRejectedValue(new Error("token leaked in message"));
    const result = await syncContributionsNow();
    expect(result).toEqual({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
  });
});
