/**
 * GitHub Search Commits aggregator for MuaraAI Organization.
 * Queries all commits authored by a given user across all repos under org:MuaraAI.
 */
export async function fetchMemberOrgCommits(username: string): Promise<number> {
  if (!username) return 0;
  const token = process.env.GITHUB_ORG_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.cloak-preview+json, application/vnd.github.v3+json",
    "User-Agent": "MuaraAI-Portal",
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  try {
    const url = `https://api.github.com/search/commits?q=org:MuaraAI+author:${encodeURIComponent(username)}`;
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) {
      console.warn(`[github:searchCommits] Failed for ${username}: HTTP ${res.status}`);
      return 0;
    }
    const data = await res.json();
    return typeof data.total_count === "number" ? data.total_count : 0;
  } catch (err) {
    console.warn(`[github:searchCommits] Error fetching for ${username}:`, err);
    return 0;
  }
}
