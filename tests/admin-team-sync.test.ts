import { beforeEach, describe, expect, it, vi } from "vitest";

const org = {
  fetchOrgTeams: vi.fn(),
  createTeam: vi.fn(),
  addTeamMember: vi.fn(),
  removeTeamMember: vi.fn(),
};
let caller = { id: "u1", hierarchy: "maintainer", roles: [] as string[] };
let membersResult: { data: unknown[] | null; error: { message: string } | null } = { data: null, error: null };

const member = (over: Record<string, unknown>) => ({ registration_status: "approved", membership_status: "active", is_active: true, hierarchy: "member", roles: [], titles: [], head_of: [], division: "builder", divisions: ["builder"], ...over });
const rows = [
  member({ github_username: "Yuken", hierarchy: "maintainer", roles: ["maintainer"], head_of: ["builder"], divisions: ["builder", "cybersecurity"] }),
  member({ github_username: "Plain" }),
  member({ github_username: "Gone", membership_status: "exited" }),
  member({ github_username: "Waiting", registration_status: "pending" }),
];

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: () => {
      const builder: Record<string, unknown> = {
        select: () => builder,
        eq: () => builder,
        single: async () => ({ data: caller }),
        then: (resolve: (value: unknown) => unknown) => resolve(membersResult.data === null && membersResult.error === null ? { data: rows, error: null } : membersResult),
      };
      return builder;
    },
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({ createPrivilegedClient: async () => ({}) }));
vi.mock("@/lib/github-org", () => ({
  fetchOrgTeams: (...args: unknown[]) => org.fetchOrgTeams(...args),
  createTeam: (...args: unknown[]) => org.createTeam(...args),
  addTeamMember: (...args: unknown[]) => org.addTeamMember(...args),
  removeTeamMember: (...args: unknown[]) => org.removeTeamMember(...args),
}));
vi.mock("resend", () => ({ Resend: class {} }));

import { applyTeamSync, previewTeamSync } from "../src/app/actions/admin";

const existing = {
  teams: { maintainers: ["yuken"], heads: [], "head-builder": [], "head-creative": [], members: ["yuken", "greeezzz", "gone", "waiting"], "member-builder": ["gone"], "member-creative": [] },
  ids: { heads: 2, members: 5 },
};

beforeEach(() => {
  process.env.GITHUB_ORG_TOKEN = "tok";
  caller = { id: "u1", hierarchy: "maintainer", roles: [] };
  membersResult = { data: null, error: null };
  org.fetchOrgTeams.mockReset().mockResolvedValue(existing);
  org.createTeam.mockReset().mockResolvedValue(77);
  org.addTeamMember.mockReset().mockResolvedValue("active");
  org.removeTeamMember.mockReset().mockResolvedValue(undefined);
});

describe("previewTeamSync", () => {
  it("returns the plan and changes nothing on GitHub", async () => {
    const result = await previewTeamSync();

    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.plan.create).toEqual([{ slug: "head-cybersecurity", parent: "heads" }, { slug: "member-cybersecurity", parent: "members" }]);
    expect(result.plan.add).toContainEqual({ team: "heads", user: "yuken" });
    expect(result.plan.add).toContainEqual({ team: "member-builder", user: "plain" });
    expect(result.plan.remove).toEqual([{ team: "members", user: "gone" }, { team: "member-builder", user: "gone" }]);
    expect(result.plan.unknown).toEqual(["greeezzz", "waiting"]);
    expect(org.createTeam).not.toHaveBeenCalled();
    expect(org.addTeamMember).not.toHaveBeenCalled();
    expect(org.removeTeamMember).not.toHaveBeenCalled();
  });

  it("does not treat a failed read of the members table as nobody being registered", async () => {
    membersResult = { data: null, error: { message: "boom secret" } };
    const result = await previewTeamSync();
    expect(result).toEqual({ success: false, error: "Gagal membaca data anggota. Coba lagi." });
    expect(org.fetchOrgTeams).not.toHaveBeenCalled();
    expect(await applyTeamSync()).toEqual({ success: false, error: "Gagal membaca data anggota. Coba lagi." });
    expect(org.removeTeamMember).not.toHaveBeenCalled();
  });

  it("rejects non-maintainers", async () => {
    caller = { id: "u1", hierarchy: "member", roles: [] };
    await expect(previewTeamSync()).rejects.toThrow("Forbidden");
    expect(org.fetchOrgTeams).not.toHaveBeenCalled();
  });

  it("says so when the server has no GitHub token, without calling GitHub", async () => {
    delete process.env.GITHUB_ORG_TOKEN;
    const result = await previewTeamSync();
    expect(result).toEqual({ success: false, error: "GITHUB_ORG_TOKEN belum diatur di server." });
    expect(org.fetchOrgTeams).not.toHaveBeenCalled();
  });

  it("hides GitHub error details", async () => {
    org.fetchOrgTeams.mockRejectedValue(new Error("GitHub GET /orgs failed: HTTP 401 secret"));
    const result = await previewTeamSync();
    expect(result.success).toBe(false);
    expect(JSON.stringify(result)).not.toContain("secret");
  });
});

describe("applyTeamSync", () => {
  it("creates the missing teams under their parents, then adds the missing people", async () => {
    const result = await applyTeamSync();

    expect(org.createTeam).toHaveBeenCalledWith("tok", "head-cybersecurity", 2);
    expect(org.createTeam).toHaveBeenCalledWith("tok", "member-cybersecurity", 5);
    expect(org.addTeamMember).toHaveBeenCalledWith("tok", "heads", "yuken");
    expect(org.addTeamMember).toHaveBeenCalledWith("tok", "member-builder", "plain");
    expect(org.addTeamMember).toHaveBeenCalledWith("tok", "member-cybersecurity", "yuken");
    expect(result).toMatchObject({ success: true, failures: [], applied: { created: 2, invited: 0, removed: 2 } });
  });

  it("removes only people who were approved and no longer belong, after the additions", async () => {
    const order: string[] = [];
    org.addTeamMember.mockImplementation(async () => { order.push("add"); return "active"; });
    org.removeTeamMember.mockImplementation(async () => { order.push("remove"); });
    await applyTeamSync();

    expect(org.removeTeamMember.mock.calls.map((call) => [call[1], call[2]])).toEqual([["members", "gone"], ["member-builder", "gone"]]);
    expect(order.lastIndexOf("add")).toBeLessThan(order.indexOf("remove"));
  });

  it("never touches people who are not approved members: unregistered GitHub users and applicants still pending", async () => {
    await applyTeamSync();
    const touched = [...org.addTeamMember.mock.calls, ...org.removeTeamMember.mock.calls].map((call) => call[2]);
    expect(touched).not.toContain("greeezzz");
    expect(touched).not.toContain("waiting");
  });

  it("counts people who were only invited to the org separately from people added to a team", async () => {
    org.addTeamMember.mockImplementation(async (_token: string, _team: string, user: string) => (user === "plain" ? "pending" : "active"));
    const result = await applyTeamSync();
    expect(result).toMatchObject({ success: true, applied: { invited: 2 } });
  });

  it("reports a failed removal and keeps going", async () => {
    org.removeTeamMember.mockImplementation(async (_token: string, team: string) => {
      if (team === "members") throw new Error("GitHub DELETE failed: HTTP 404");
    });
    const result = await applyTeamSync();
    expect(result.success).toBe(false);
    if (!("failures" in result)) return;
    expect(result.failures).toEqual([{ action: "remove", team: "members", user: "gone" }]);
    expect(org.removeTeamMember).toHaveBeenCalledWith("tok", "member-builder", "gone");
  });

  it("keeps going when one change fails and reports it", async () => {
    org.addTeamMember.mockImplementation(async (_token: string, team: string) => {
      if (team === "heads") throw new Error("GitHub PUT failed: HTTP 404");
    });
    const result = await applyTeamSync();

    expect(result.success).toBe(false);
    if (!("failures" in result)) return;
    expect(result.failures).toEqual([{ action: "add", team: "heads", user: "yuken" }]);
    expect(org.addTeamMember).toHaveBeenCalledWith("tok", "member-builder", "plain");
  });

  it("does not add anyone to a team it could not create", async () => {
    org.createTeam.mockRejectedValue(new Error("GitHub POST failed: HTTP 403"));
    const result = await applyTeamSync();

    expect(org.addTeamMember).not.toHaveBeenCalledWith("tok", "head-cybersecurity", expect.anything());
    expect(org.addTeamMember).not.toHaveBeenCalledWith("tok", "member-cybersecurity", expect.anything());
    expect(result.success).toBe(false);
  });

  it("rejects non-maintainers", async () => {
    caller = { id: "u1", hierarchy: "member", roles: [] };
    await expect(applyTeamSync()).rejects.toThrow("Forbidden");
    expect(org.addTeamMember).not.toHaveBeenCalled();
  });
});
