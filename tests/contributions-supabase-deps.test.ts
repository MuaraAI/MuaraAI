import { describe, expect, it, vi } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";

vi.mock("@/lib/notify", () => ({ notifyMaintainers: vi.fn(async () => ({})) }));
vi.mock("../src/lib/contributions/emails", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/contributions/emails")>()),
  sendContributionEmail: vi.fn(async () => undefined),
}));

import { buildSupabaseDeps } from "../src/lib/contributions/supabase-deps";

interface Op {
  table: string;
  op: string;
  args: unknown[];
}

function fakeClient(responses: Record<string, unknown> = {}) {
  const ops: Op[] = [];
  const from = (table: string) => {
    const builder: Record<string, unknown> = {};
    const record = (op: string) => (...args: unknown[]) => {
      ops.push({ table, op, args });
      return builder;
    };
    for (const op of ["select", "eq", "update"]) builder[op] = record(op);
    builder.upsert = (...args: unknown[]) => {
      ops.push({ table, op: "upsert", args });
      const result = { error: null, data: responses[`${table}.upserted`] ?? [] };
      return { then: (resolve: (value: unknown) => unknown) => resolve(result), select: async () => result };
    };
    builder.maybeSingle = async () => ({ data: responses[`${table}.one`] ?? null, error: null });
    builder.then = (resolve: (value: unknown) => unknown) => resolve({ data: responses[`${table}.list`] ?? [], error: null });
    return builder;
  };
  return { client: { from } as unknown as SupabaseClient, ops };
}

const github = { token: "tok" };

describe("buildSupabaseDeps", () => {
  it("loads only approved, active members and maps them to engine members", async () => {
    const { client, ops } = fakeClient({
      "members.list": [
        {
          id: "m1",
          github_username: "budi",
          full_name: "Budi",
          email: "b@example.com",
          division: "creative",
          membership_started_at: "2026-09-10T00:00:00Z",
          contribution_standing: "warned",
        },
      ],
    });
    const members = await buildSupabaseDeps(client, github).loadMembers();

    expect(members).toEqual([
      {
        id: "m1",
        githubUsername: "budi",
        fullName: "Budi",
        email: "b@example.com",
        division: "creative",
        membershipStartedAt: "2026-09-10T00:00:00Z",
        standing: "warned",
      },
    ]);
    const filters = ops.filter((op) => op.op === "eq").map((op) => op.args);
    expect(filters).toEqual(
      expect.arrayContaining([
        ["registration_status", "approved"],
        ["membership_status", "active"],
        ["is_active", true],
      ])
    );
  });

  it("falls back to the default rules when the setting is missing", async () => {
    const { client } = fakeClient();
    const rules = await buildSupabaseDeps(client, github).loadRules();
    expect(rules.enforcement).toBe("dry_run");
  });

  it("upserts monthly stats with snake_case columns and the composite conflict target", async () => {
    const { client, ops } = fakeClient();
    await buildSupabaseDeps(client, github).saveStats("m1", "2026-11-01", {
      mergedPrs: 10,
      externalPrs: 5,
      commits: 50,
      newRepos: 1,
      newWorks: 0,
    });
    const upsert = ops.find((op) => op.table === "monthly_contributions" && op.op === "upsert")!;
    expect(upsert.args[0]).toMatchObject({
      member_id: "m1",
      month: "2026-11-01",
      merged_prs: 10,
      external_prs: 5,
      commits: 50,
      new_repos: 1,
      new_works: 0,
    });
    expect(upsert.args[1]).toEqual({ onConflict: "member_id,month" });
  });

  it("never overwrites an existing evaluation", async () => {
    const { client, ops } = fakeClient();
    await buildSupabaseDeps(client, github).saveEvaluation({ memberId: "m1", month: "2026-11-01", met: false, action: "warn", enforced: true });
    const upsert = ops.find((op) => op.table === "contribution_evaluations" && op.op === "upsert")!;
    expect(upsert.args[0]).toMatchObject({ member_id: "m1", month: "2026-11-01", met: false, action: "warn", enforced: true });
    expect(upsert.args[1]).toEqual({ onConflict: "member_id,month", ignoreDuplicates: true });
  });

  it("reports whether this call really inserted the evaluation", async () => {
    const row = { memberId: "m1", month: "2026-11-01", met: false, action: "warn" as const, enforced: true };
    const inserted = fakeClient({ "contribution_evaluations.upserted": [{ member_id: "m1" }] });
    expect(await buildSupabaseDeps(inserted.client, github).saveEvaluation(row)).toBe(true);
    const duplicate = fakeClient({ "contribution_evaluations.upserted": [] });
    expect(await buildSupabaseDeps(duplicate.client, github).saveEvaluation(row)).toBe(false);
  });

  it("kicks by closing the membership, not by deleting the member", async () => {
    const { client, ops } = fakeClient();
    await buildSupabaseDeps(client, github).kickMember("m1", "Dikeluarkan otomatis");
    const update = ops.find((op) => op.table === "members" && op.op === "update")!;
    expect(update.args[0]).toMatchObject({ membership_status: "exited", is_active: false, exit_reason: "Dikeluarkan otomatis" });
    expect(ops.some((op) => op.op === "eq" && op.args[0] === "id" && op.args[1] === "m1")).toBe(true);
  });

  it("updates the standing of a single member", async () => {
    const { client, ops } = fakeClient();
    await buildSupabaseDeps(client, github).setStanding("m1", "warned");
    const update = ops.find((op) => op.table === "members" && op.op === "update")!;
    expect(update.args[0]).toMatchObject({ contribution_standing: "warned" });
  });
});
