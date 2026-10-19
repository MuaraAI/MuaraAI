import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchMemberOrgCommits } from "../src/lib/github-sync";

describe("GitHub Org Commit Aggregator", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 0 if username is empty", async () => {
    const count = await fetchMemberOrgCommits("");
    expect(count).toBe(0);
  });

  it("queries the search commits API for org:MuaraAI and returns total_count", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: true,
      json: async () => ({ total_count: 486 }),
    } as Response);

    const count = await fetchMemberOrgCommits("Curzyori");
    expect(count).toBe(486);
    expect(fetchSpy).toHaveBeenCalledWith(
      "https://api.github.com/search/commits?q=org:MuaraAI+author:Curzyori",
      expect.objectContaining({
        headers: expect.objectContaining({
          "User-Agent": "MuaraAI-Portal",
        }),
      })
    );
  });

  it("handles non-200 responses gracefully without throwing", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce({
      ok: false,
      status: 403,
    } as Response);

    const count = await fetchMemberOrgCommits("rate_limited_user");
    expect(count).toBe(0);
  });
});
