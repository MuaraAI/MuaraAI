import { describe, expect, it, vi } from "vitest";
import { fetchOrgRepos, parseRepos } from "../src/lib/github-repos";

const repo = (over: Record<string, unknown> = {}) => ({
  name: "muara-arus-1",
  description: "AI lokal",
  html_url: "https://github.com/MuaraAI/muara-arus-1",
  language: "Python",
  stargazers_count: 12,
  pushed_at: "2026-11-20T10:00:00Z",
  fork: false,
  archived: false,
  ...over,
});

describe("parseRepos", () => {
  it("maps public repos and sorts the most recently pushed first", () => {
    const result = parseRepos([
      repo({ name: "old", pushed_at: "2026-01-01T00:00:00Z" }),
      repo({ name: "new", pushed_at: "2026-11-25T00:00:00Z" }),
    ]);
    expect(result.map((item) => item.name)).toEqual(["new", "old"]);
    expect(result[0]).toEqual({
      name: "new",
      description: "AI lokal",
      url: "https://github.com/MuaraAI/muara-arus-1",
      language: "Python",
      stars: 12,
      pushedAt: "2026-11-25T00:00:00Z",
    });
  });

  it("drops forks, archived repos, and malformed entries", () => {
    const result = parseRepos([repo({ name: "fork", fork: true }), repo({ name: "dead", archived: true }), null, "x", { name: 3 }, repo({ name: "ok" })]);
    expect(result.map((item) => item.name)).toEqual(["ok"]);
  });

  it("only keeps https github.com links and tolerates missing optional fields", () => {
    const result = parseRepos([repo({ name: "evil", html_url: "javascript:alert(1)" }), repo({ name: "plain", description: null, language: null, stargazers_count: undefined })]);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ name: "plain", description: "", language: "", stars: 0 });
  });

  it("returns an empty list for anything that is not an array", () => {
    for (const bad of [null, undefined, {}, "x", 7]) expect(parseRepos(bad)).toEqual([]);
  });
});

describe("fetchOrgRepos", () => {
  const response = (body: unknown, status = 200) => ({ ok: status >= 200 && status < 300, status, json: async () => body }) as unknown as Response;

  it("asks GitHub for the org's public repos and reports ok", async () => {
    const fetchImpl = vi.fn(async () => response([repo()]));
    const result = await fetchOrgRepos("MuaraAI", { fetchImpl: fetchImpl as unknown as typeof fetch, token: "tok" });

    expect(result.ok).toBe(true);
    expect(result.repos).toHaveLength(1);
    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toContain("/orgs/MuaraAI/repos");
    expect(url).toContain("type=public");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
  });

  it("works without a token", async () => {
    const fetchImpl = vi.fn(async () => response([]));
    const result = await fetchOrgRepos("MuaraAI", { fetchImpl: fetchImpl as unknown as typeof fetch });
    expect(result).toEqual({ repos: [], ok: true });
    expect(((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it("reports not ok instead of throwing when GitHub fails", async () => {
    expect(await fetchOrgRepos("MuaraAI", { fetchImpl: vi.fn(async () => response({}, 403)) as unknown as typeof fetch })).toEqual({ repos: [], ok: false });
    expect(await fetchOrgRepos("MuaraAI", { fetchImpl: vi.fn(async () => { throw new Error("down"); }) as unknown as typeof fetch })).toEqual({ repos: [], ok: false });
  });

  it("refuses a suspicious org name without calling GitHub", async () => {
    const fetchImpl = vi.fn();
    expect(await fetchOrgRepos("Mu/ara", { fetchImpl: fetchImpl as unknown as typeof fetch })).toEqual({ repos: [], ok: false });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
