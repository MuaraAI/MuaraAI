import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { addTeamMember, createTeam, fetchOrgTeams, removeTeamMember } from "../src/lib/github-org";

const calls: { url: string; method: string; body?: string; auth?: string }[] = [];
const respond = vi.fn();

beforeEach(() => {
  calls.length = 0;
  respond.mockReset();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, method: init?.method ?? "GET", body: init?.body as string | undefined, auth: (init?.headers as Record<string, string>)?.Authorization });
      return respond(url, init);
    }),
  );
});
afterEach(() => vi.unstubAllGlobals());

const json = (data: unknown, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } });

describe("fetchOrgTeams", () => {
  it("returns the members of every managed team that exists (lowercase), with team ids, and ignores other teams", async () => {
    respond.mockImplementation((url: string) => {
      if (url.endsWith("/orgs/MuaraAI/teams?per_page=100")) {
        return json([{ slug: "maintainers", id: 1 }, { slug: "heads", id: 2 }, { slug: "hackthon-1", id: 3 }, { slug: "leads", id: 4 }]);
      }
      if (url.includes("/teams/maintainers/members")) return json([{ login: "Yuken" }, { login: "Verzio" }]);
      if (url.includes("/teams/heads/members")) return json([]);
      throw new Error(`unexpected ${url}`);
    });

    const result = await fetchOrgTeams("tok");

    expect(result.teams).toEqual({ maintainers: ["yuken", "verzio"], heads: [] });
    expect(result.ids).toEqual({ maintainers: 1, heads: 2 });
    expect(calls.every((call) => call.auth === "Bearer tok")).toBe(true);
    expect(calls.some((call) => call.url.includes("hackthon-1") || call.url.includes("/leads/"))).toBe(false);
  });

  it("throws with the status (never the token) when GitHub refuses", async () => {
    respond.mockResolvedValue(json({ message: "Bad credentials" }, 401));
    const error = await fetchOrgTeams("secret-token").catch((e: Error) => e);
    expect((error as Error).message).toContain("401");
    expect((error as Error).message).not.toContain("secret-token");
  });
});

describe("changing teams", () => {
  it("creates a team under its parent", async () => {
    respond.mockResolvedValue(json({ id: 9, slug: "head-cybersecurity" }, 201));
    await expect(createTeam("tok", "head-cybersecurity", 2)).resolves.toBe(9);
    expect(calls[0]).toMatchObject({ method: "POST", url: "https://api.github.com/orgs/MuaraAI/teams" });
    expect(JSON.parse(calls[0].body ?? "{}")).toEqual({ name: "head-cybersecurity", privacy: "closed", parent_team_id: 2 });
  });

  it("adds and removes a member with the team slug and username in the path, encoded", async () => {
    respond.mockResolvedValue(new Response(null, { status: 204 }));
    await addTeamMember("tok", "head-creative", "verzio");
    await removeTeamMember("tok", "head-creative", "yuken");
    expect(calls[0]).toMatchObject({ method: "PUT", url: "https://api.github.com/orgs/MuaraAI/teams/head-creative/memberships/verzio" });
    expect(JSON.parse(calls[0].body ?? "{}")).toEqual({ role: "member" });
    expect(calls[1]).toMatchObject({ method: "DELETE", url: "https://api.github.com/orgs/MuaraAI/teams/head-creative/memberships/yuken" });

    calls.length = 0;
    await addTeamMember("tok", "a/b", "x y");
    expect(calls[0].url).toBe("https://api.github.com/orgs/MuaraAI/teams/a%2Fb/memberships/x%20y");
  });

  it("reports a failed change with its status", async () => {
    respond.mockResolvedValue(json({ message: "Not Found" }, 404));
    await expect(addTeamMember("tok", "heads", "nobody")).rejects.toThrow("404");
  });
});
