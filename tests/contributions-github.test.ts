import { describe, expect, it, vi } from "vitest";
import { fetchMergedPrs, fetchOrgReposCreatedInMonth, fetchRepoCreator, verifyGithubLogin } from "../src/lib/contributions/github";

function response(body: unknown, init: { status?: number; headers?: Record<string, string> } = {}) {
  const status = init.status ?? 200;
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    headers: { get: (name: string) => init.headers?.[name] ?? init.headers?.[name.toLowerCase()] ?? null },
  } as unknown as Response;
}

const prNode = (over: Record<string, unknown> = {}) => ({
  mergedAt: "2026-11-10T00:00:00Z",
  author: { login: "budi" },
  repository: { name: "site" },
  commits: { totalCount: 4 },
  labels: { nodes: [{ name: "karya-baru" }] },
  reviews: {
    nodes: [
      { state: "APPROVED", author: { login: "sari" } },
      { state: "COMMENTED", author: { login: "joko" } },
      { state: "APPROVED", author: null },
    ],
  },
  ...over,
});

const page = (nodes: unknown[], next: string | null = null) => ({
  data: { search: { pageInfo: { hasNextPage: next !== null, endCursor: next }, nodes } },
});

describe("fetchMergedPrs", () => {
  it("maps merged PRs, keeping only APPROVED reviewers, and skips non-PR nodes", async () => {
    const fetchImpl = vi.fn(async () => response(page([prNode(), {}])));
    const result = await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl });

    expect(result.complete).toBe(true);
    expect(result.prs).toEqual([
      {
        repo: "site",
        author: "budi",
        mergedAt: "2026-11-10T00:00:00Z",
        commits: 4,
        approvedBy: ["sari"],
        labels: ["karya-baru"],
      },
    ]);
  });

  it("sends an authenticated GraphQL search scoped to the org, author and month", async () => {
    const fetchImpl = vi.fn(async () => response(page([])));
    await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl });

    const [url, init] = fetchImpl.mock.calls[0] as unknown as [string, RequestInit];
    expect(url).toBe("https://api.github.com/graphql");
    expect((init.headers as Record<string, string>).Authorization).toBe("Bearer tok");
    expect((init.headers as Record<string, string>)["User-Agent"]).toBe("MuaraAI-Portal");
    const { variables } = JSON.parse(init.body as string);
    expect(variables.q).toBe("org:MuaraAI is:pr is:merged author:budi merged:2026-11-01..2026-11-30");
  });

  it("asks only for APPROVED reviews so bot and comment reviews cannot push an approval out of the window", async () => {
    const fetchImpl = vi.fn(async () => response(page([])));
    await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl });
    const { query } = JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string);
    expect(query).toContain("reviews(states: APPROVED");
  });

  it("follows pagination and merges the pages", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce(response(page([prNode()], "c1")))
      .mockResolvedValueOnce(response(page([prNode({ repository: { name: "docs" } })])));
    const result = await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl });

    expect(result.complete).toBe(true);
    expect(result.prs.map((pr) => pr.repo)).toEqual(["site", "docs"]);
    expect(JSON.parse((fetchImpl.mock.calls[1] as unknown as [string, RequestInit])[1].body as string).variables.after).toBe("c1");
  });

  it("reports incomplete data instead of guessing when the API fails", async () => {
    const forbidden = vi.fn(async () => response({}, { status: 403 }));
    expect((await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl: forbidden })).complete).toBe(false);

    const graphqlError = vi.fn(async () => response({ errors: [{ message: "rate limited" }] }));
    expect((await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl: graphqlError })).complete).toBe(false);

    const thrown = vi.fn(async () => {
      throw new Error("network down");
    });
    expect((await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl: thrown })).complete).toBe(false);
  });

  it("is incomplete when there are more than five pages", async () => {
    const fetchImpl = vi.fn(async () => response(page([prNode()], "more")));
    const result = await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl });
    expect(fetchImpl).toHaveBeenCalledTimes(5);
    expect(result.complete).toBe(false);
  });

  it("refuses to call the API without a token or with suspicious input", async () => {
    const fetchImpl = vi.fn();
    expect((await fetchMergedPrs("budi", "2026-11-01", "MuaraAI", { token: undefined, fetchImpl })).complete).toBe(false);
    expect((await fetchMergedPrs("bu di", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl })).complete).toBe(false);
    expect((await fetchMergedPrs("budi merged:2020-01-01..2020-12-31", "2026-11-01", "MuaraAI", { token: "tok", fetchImpl })).complete).toBe(false);
    expect((await fetchMergedPrs("budi", "2026-11-15", "MuaraAI", { token: "tok", fetchImpl })).complete).toBe(false);
    expect((await fetchMergedPrs("budi", "2026-11-01", "Mu/ara", { token: "tok", fetchImpl })).complete).toBe(false);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("verifyGithubLogin", () => {
  it("confirms an existing account", async () => {
    const fetchImpl = vi.fn(async () => response({ data: { user: { login: "budi" } } }));
    expect(await verifyGithubLogin("budi", { token: "tok", fetchImpl })).toBe("ok");
    expect(JSON.parse((fetchImpl.mock.calls[0] as unknown as [string, RequestInit])[1].body as string).variables.login).toBe("budi");
  });

  it("reports an account GitHub says does not exist", async () => {
    const fetchImpl = vi.fn(async () => response({ data: { user: null }, errors: [{ type: "NOT_FOUND" }] }));
    expect(await verifyGithubLogin("ghost", { token: "tok", fetchImpl })).toBe("missing");
  });

  it("treats a malformed username as missing without calling the API", async () => {
    const fetchImpl = vi.fn();
    expect(await verifyGithubLogin("bu di", { token: "tok", fetchImpl })).toBe("missing");
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("returns error (not missing) when GitHub cannot answer", async () => {
    expect(await verifyGithubLogin("budi", { token: "tok", fetchImpl: vi.fn(async () => response({}, { status: 502 })) })).toBe("error");
    expect(await verifyGithubLogin("budi", { token: "tok", fetchImpl: vi.fn(async () => { throw new Error("down"); }) })).toBe("error");
    expect(await verifyGithubLogin("budi", { token: "tok", fetchImpl: vi.fn(async () => response({ errors: [{ type: "RATE_LIMITED" }] })) })).toBe("error");
    const noToken = vi.fn();
    expect(await verifyGithubLogin("budi", { token: undefined, fetchImpl: noToken })).toBe("error");
    expect(noToken).not.toHaveBeenCalled();
  });
});

describe("fetchRepoCreator", () => {
  const route = (commitsLast: unknown, link: string | null) =>
    vi.fn(async (url: string) => {
      if (url.endsWith("/repos/MuaraAI/site")) return response({ created_at: "2026-01-02T00:00:00Z" });
      if (url.includes("per_page=1&page=57")) return response(commitsLast);
      if (url.includes("/commits?per_page=1")) {
        return response([{ author: { login: "newest" } }], link ? { headers: { Link: link } } : {});
      }
      return response({}, { status: 404 });
    }) as unknown as typeof fetch;

  it("returns the author of the very first commit using the last page of the commit list", async () => {
    const link =
      '<https://api.github.com/repositories/1/commits?per_page=1&page=2>; rel="next", <https://api.github.com/repositories/1/commits?per_page=1&page=57>; rel="last"';
    const fetchImpl = route([{ author: { login: "sari" } }], link);
    const result = await fetchRepoCreator("site", "MuaraAI", { token: "tok", fetchImpl });
    expect(result).toEqual({ creator: "sari", createdAt: "2026-01-02T00:00:00Z", ok: true });
  });

  it("uses the only page when the repo has a single commit and tolerates non-GitHub authors", async () => {
    const single = await fetchRepoCreator("site", "MuaraAI", { token: "tok", fetchImpl: route([], null) });
    expect(single).toEqual({ creator: "newest", createdAt: "2026-01-02T00:00:00Z", ok: true });

    const link = '<https://api.github.com/repositories/1/commits?per_page=1&page=57>; rel="last"';
    const noAccount = await fetchRepoCreator("site", "MuaraAI", { token: "tok", fetchImpl: route([{ author: null }], link) });
    expect(noAccount).toEqual({ creator: null, createdAt: "2026-01-02T00:00:00Z", ok: true });
  });

  it("is not ok when the repo cannot be read or the name is suspicious", async () => {
    const fetchImpl = route([], null);
    expect((await fetchRepoCreator("missing", "MuaraAI", { token: "tok", fetchImpl })).ok).toBe(false);
    expect((await fetchRepoCreator("../etc", "MuaraAI", { token: "tok", fetchImpl })).ok).toBe(false);
    expect((await fetchRepoCreator("site", "MuaraAI", { token: undefined, fetchImpl })).ok).toBe(false);
  });
});

describe("fetchOrgReposCreatedInMonth", () => {
  it("keeps only repos created inside the month", async () => {
    const body = {
      data: {
        organization: {
          repositories: {
            pageInfo: { hasNextPage: false, endCursor: null },
            nodes: [
              { name: "a", createdAt: "2026-11-20T00:00:00Z" },
              { name: "b", createdAt: "2026-11-02T00:00:00Z" },
              { name: "c", createdAt: "2026-10-31T23:59:59Z" },
            ],
          },
        },
      },
    };
    const fetchImpl = vi.fn(async () => response(body));
    const result = await fetchOrgReposCreatedInMonth("MuaraAI", "2026-11-01", { token: "tok", fetchImpl });
    expect(result.ok).toBe(true);
    expect(result.repos.map((repo) => repo.name)).toEqual(["a", "b"]);
  });

  it("is not ok when the API fails", async () => {
    const fetchImpl = vi.fn(async () => response({}, { status: 500 }));
    expect((await fetchOrgReposCreatedInMonth("MuaraAI", "2026-11-01", { token: "tok", fetchImpl })).ok).toBe(false);
  });
});
