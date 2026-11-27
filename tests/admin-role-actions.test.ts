import { beforeEach, describe, expect, it, vi } from "vitest";

const updates: Record<string, unknown>[] = [];
let caller = { id: "u1", hierarchy: "maintainer", roles: [] as string[] };
let target: Record<string, unknown> | null = { id: "t1", hierarchy: "member", roles: [], titles: [], division: "builder" };
let maintainers = [{ id: "u1" }, { id: "t1" }];
let updateError: { message: string } | null = null;
const positions = { builder: ["Frontend", "Backend", "IoT"], creative: ["Video"], cybersecurity: ["Pentester"] };

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: (table: string) => {
      if (table === "community_settings") {
        return { select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { value: positions } }) }) }) };
      }
      let filterId: string | null = null;
      let isMaintainerQuery = false;
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: (_column: string, value: string) => {
          filterId = value;
          return builder;
        },
        or: () => {
          isMaintainerQuery = true;
          return builder;
        },
        single: async () => ({ data: caller }),
        maybeSingle: async () => ({ data: filterId === "u1" ? caller : target }),
        then: (resolve: (value: unknown) => unknown) => resolve({ data: isMaintainerQuery ? maintainers : [] }),
        update: (payload: Record<string, unknown>) => ({
          eq: async () => {
            updates.push(payload);
            return { error: updateError };
          },
        }),
      };
      return builder;
    },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({ createPrivilegedClient: async () => ({}) }));
vi.mock("resend", () => ({ Resend: class {} }));

import { setMemberRole } from "../src/app/actions/admin";

beforeEach(() => {
  updates.length = 0;
  caller = { id: "u1", hierarchy: "maintainer", roles: [] };
  target = { id: "t1", hierarchy: "member", roles: [], titles: [], division: "builder" };
  maintainers = [{ id: "u1" }, { id: "t1" }];
  updateError = null;
});

const change = (over: Record<string, unknown> = {}) => ({ maintainer: false, divisions: ["builder"], primary: "builder", headOf: [], tracks: [], ...over });

describe("setMemberRole", () => {
  it("makes someone Head of one division and a member of several, with positions, and keeps every role field in step", async () => {
    const result = await setMemberRole("t1", change({ divisions: ["builder", "creative"], primary: "creative", headOf: ["creative"], tracks: ["Video", "IoT"] }));

    expect(result).toEqual({ success: true });
    expect(updates).toEqual([
      {
        hierarchy: "head",
        titles: [],
        roles: ["head-creative"],
        head_of: ["creative"],
        division: "creative",
        divisions: ["builder", "creative"],
        tracks: ["Video", "IoT"],
        track: "Video",
        role_title: "Head of Creative",
      },
    ]);
  });

  it("promotes a founder to maintainer and Head of two divisions, keeping Founder and dropping the derived titles", async () => {
    target = { id: "t1", hierarchy: "member", roles: [], titles: ["Founder", "Maintainer", "Head of Builder"], division: "builder" };
    await setMemberRole("t1", change({ maintainer: true, divisions: ["builder", "cybersecurity"], headOf: ["builder", "cybersecurity"] }));

    expect(updates[0]).toEqual(
      expect.objectContaining({
        hierarchy: "maintainer",
        titles: ["Founder"],
        roles: ["maintainer", "head-builder", "head-cybersecurity"],
        head_of: ["builder", "cybersecurity"],
        role_title: "Founder",
      }),
    );
  });

  it("removes maintainer and head entries from the legacy roles when demoting, so database access is really revoked", async () => {
    target = { id: "t1", hierarchy: "maintainer", roles: ["maintainer", "head-builder", "Builder"], titles: ["Co-Founder"], division: "builder" };
    await setMemberRole("t1", change());

    expect(updates[0]).toEqual(expect.objectContaining({ hierarchy: "member", roles: ["Builder"], head_of: [], role_title: "Co-Founder" }));
  });

  it("keeps an existing lead as lead when nothing else applies", async () => {
    target = { id: "t1", hierarchy: "lead", roles: [], titles: [], division: "builder" };
    await setMemberRole("t1", change());
    expect(updates[0]).toEqual(expect.objectContaining({ hierarchy: "lead", role_title: "Member" }));
  });

  it("refuses to demote the last maintainer", async () => {
    target = { id: "u1", hierarchy: "maintainer", roles: [], titles: [], division: "builder" };
    maintainers = [{ id: "u1" }];

    const result = await setMemberRole("u1", change());

    expect(result.success).toBe(false);
    expect(updates).toEqual([]);
  });

  it("rejects non-maintainers", async () => {
    caller = { id: "u1", hierarchy: "head", roles: [] };
    await expect(setMemberRole("t1", change())).rejects.toThrow("Forbidden");
    expect(updates).toEqual([]);
  });

  it("rejects divisions, heads and positions that do not fit together or are not on the lists", async () => {
    for (const bad of [
      change({ divisions: [] }),
      change({ divisions: ["marketing"], primary: "marketing" }),
      change({ primary: "creative" }),
      change({ headOf: ["creative"] }),
      change({ tracks: ["Video"] }),
      change({ tracks: ["Made up"] }),
      change({ maintainer: "yes" }),
      "head",
    ]) {
      expect((await setMemberRole("t1", bad)).success).toBe(false);
    }
    expect(updates).toEqual([]);
  });

  it("answers for an unknown member and hides database error details", async () => {
    target = null;
    expect((await setMemberRole("missing", change())).success).toBe(false);

    target = { id: "t1", hierarchy: "member", roles: [], titles: [], division: "builder" };
    updateError = { message: "secret table detail" };
    const result = await setMemberRole("t1", change());
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("secret");
  });
});
