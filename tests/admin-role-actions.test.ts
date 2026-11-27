import { beforeEach, describe, expect, it, vi } from "vitest";

const updates: Record<string, unknown>[] = [];
let caller = { id: "u1", hierarchy: "maintainer", roles: [] as string[] };
let target: Record<string, unknown> | null = { id: "t1", hierarchy: "member", roles: [], division: "builder" };
let maintainers = [{ id: "u1" }, { id: "t1" }];
let updateError: { message: string } | null = null;
const positions = { builder: ["Frontend", "Backend"], creative: ["Video"] };

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
  target = { id: "t1", hierarchy: "member", roles: [], division: "builder" };
  maintainers = [{ id: "u1" }, { id: "t1" }];
  updateError = null;
});

describe("setMemberRole", () => {
  it("promotes a member to head of a division, with a position, and keeps the other role fields in step", async () => {
    const result = await setMemberRole("t1", { hierarchy: "head", division: "creative", track: "Video" });

    expect(result).toEqual({ success: true });
    expect(updates).toEqual([
      expect.objectContaining({ hierarchy: "head", division: "creative", track: "Video", sub_hierarchy: "head-creative", role_title: "Head of Creative", roles: [] }),
    ]);
  });

  it("adds maintainer to the legacy roles list when promoting to maintainer, and leaves sub_hierarchy and the title alone", async () => {
    await setMemberRole("t1", { hierarchy: "maintainer", division: "builder", track: "" });

    expect(updates[0]).toEqual(expect.objectContaining({ hierarchy: "maintainer", roles: ["maintainer"], track: null }));
    expect(updates[0]).not.toHaveProperty("sub_hierarchy");
    expect(updates[0]).not.toHaveProperty("role_title");
  });

  it("removes maintainer from roles when demoting, so database access is really revoked", async () => {
    target = { id: "t1", hierarchy: "maintainer", roles: ["maintainer", "Builder"], division: "builder" };
    await setMemberRole("t1", { hierarchy: "lead", division: "builder", track: "" });

    expect(updates[0]).toEqual(expect.objectContaining({ hierarchy: "lead", roles: ["Builder"], sub_hierarchy: "lead-builder", role_title: "Builder Lead" }));
  });

  it("refuses to demote the last maintainer", async () => {
    target = { id: "u1", hierarchy: "maintainer", roles: [], division: "builder" };
    maintainers = [{ id: "u1" }];

    const result = await setMemberRole("u1", { hierarchy: "member", division: "builder", track: "" });

    expect(result.success).toBe(false);
    expect(updates).toEqual([]);
  });

  it("rejects non-maintainers", async () => {
    caller = { id: "u1", hierarchy: "head", roles: [] };
    await expect(setMemberRole("t1", { hierarchy: "head", division: "builder", track: "" })).rejects.toThrow("Forbidden");
    expect(updates).toEqual([]);
  });

  it("rejects ranks, divisions and positions outside the lists", async () => {
    for (const bad of [
      { hierarchy: "owner", division: "builder", track: "" },
      { hierarchy: "head", division: "marketing", track: "" },
      { hierarchy: "head", division: "creative", track: "Frontend" },
      "head",
    ]) {
      expect((await setMemberRole("t1", bad)).success).toBe(false);
    }
    expect(updates).toEqual([]);
  });

  it("answers for an unknown member and hides database error details", async () => {
    target = null;
    expect((await setMemberRole("missing", { hierarchy: "head", division: "builder", track: "" })).success).toBe(false);

    target = { id: "t1", hierarchy: "member", roles: [], division: "builder" };
    updateError = { message: "secret table detail" };
    const result = await setMemberRole("t1", { hierarchy: "head", division: "builder", track: "" });
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("secret");
  });
});
