export interface OrgRepo {
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  pushedAt: string;
}

const ORG_PATTERN = /^[A-Za-z0-9-]{1,39}$/;
const MAX_REPOS = 30;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/** Public, non-fork, non-archived repos, most recently pushed first. Anything malformed is dropped. */
export function parseRepos(data: unknown): OrgRepo[] {
  if (!Array.isArray(data)) return [];

  const repos: OrgRepo[] = [];
  for (const item of data) {
    if (!isRecord(item) || typeof item.name !== "string" || typeof item.html_url !== "string") continue;
    if (item.fork === true || item.archived === true) continue;
    if (!item.html_url.startsWith("https://github.com/")) continue;

    repos.push({
      name: item.name,
      description: typeof item.description === "string" ? item.description : "",
      url: item.html_url,
      language: typeof item.language === "string" ? item.language : "",
      stars: typeof item.stargazers_count === "number" ? item.stargazers_count : 0,
      pushedAt: typeof item.pushed_at === "string" ? item.pushed_at : "",
    });
  }

  return repos.sort((a, b) => Date.parse(b.pushedAt || "0") - Date.parse(a.pushedAt || "0")).slice(0, MAX_REPOS);
}

/** Never throws: a failure is reported as `ok: false` so the page can say so instead of crashing. */
export async function fetchOrgRepos(
  org: string,
  deps: { fetchImpl?: typeof fetch; token?: string } = {}
): Promise<{ repos: OrgRepo[]; ok: boolean }> {
  if (!ORG_PATTERN.test(org)) return { repos: [], ok: false };

  const headers: Record<string, string> = { Accept: "application/vnd.github+json", "User-Agent": "MuaraAI-Portal" };
  if (deps.token) headers.Authorization = `Bearer ${deps.token}`;

  try {
    const response = await (deps.fetchImpl ?? fetch)(
      `https://api.github.com/orgs/${org}/repos?type=public&sort=pushed&per_page=100`,
      { headers, next: { revalidate: 3600 }, signal: AbortSignal.timeout(10_000) } as RequestInit
    );
    if (!response.ok) return { repos: [], ok: false };
    return { repos: parseRepos(await response.json()), ok: true };
  } catch {
    return { repos: [], ok: false };
  }
}
