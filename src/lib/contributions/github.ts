import { nextMonth, type PullRequestFact } from "./rules";

export interface GithubDeps {
  token: string | undefined;
  fetchImpl?: typeof fetch;
}

const API = "https://api.github.com";
const NAME_PATTERN = /^[A-Za-z0-9-]+$/;
const REPO_PATTERN = /^[A-Za-z0-9._-]+$/;
const MONTH_PATTERN = /^\d{4}-\d{2}-01$/;
const MAX_PAGES = 5;
const TIMEOUT_MS = 10_000;

const headers = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "User-Agent": "MuaraAI-Portal",
  "Content-Type": "application/json",
});

async function graphql<T>(query: string, variables: Record<string, unknown>, deps: GithubDeps): Promise<T | null> {
  if (!deps.token) return null;
  try {
    const response = await (deps.fetchImpl ?? fetch)(`${API}/graphql`, {
      method: "POST",
      headers: headers(deps.token),
      body: JSON.stringify({ query, variables }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return null;
    const body = (await response.json()) as { data?: T; errors?: unknown };
    if (body.errors || !body.data) return null;
    return body.data;
  } catch {
    return null;
  }
}

async function rest(path: string, deps: GithubDeps): Promise<Response | null> {
  if (!deps.token) return null;
  try {
    const response = await (deps.fetchImpl ?? fetch)(`${API}${path}`, {
      headers: headers(deps.token),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    return response.ok ? response : null;
  } catch {
    return null;
  }
}

const lastDayOf = (month: string): string => {
  const [year, monthNumber] = month.split("-").map(Number);
  const day = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  return `${month.slice(0, 8)}${String(day).padStart(2, "0")}`;
};

const SEARCH_QUERY = `query($q: String!, $after: String) {
  search(query: $q, type: ISSUE, first: 50, after: $after) {
    pageInfo { hasNextPage endCursor }
    nodes {
      ... on PullRequest {
        mergedAt
        author { login }
        repository { name }
        commits { totalCount }
        labels(first: 20) { nodes { name } }
        reviews(states: APPROVED, first: 50) { nodes { state author { login } } }
      }
    }
  }
}`;

interface PrNode {
  mergedAt?: string;
  author?: { login?: string } | null;
  repository?: { name?: string };
  commits?: { totalCount?: number };
  labels?: { nodes?: { name?: string }[] };
  reviews?: { nodes?: { state?: string; author?: { login?: string } | null }[] };
}

function toFact(node: PrNode): PullRequestFact | null {
  if (!node.repository?.name || !node.mergedAt) return null;
  return {
    repo: node.repository.name,
    author: node.author?.login ?? "",
    mergedAt: node.mergedAt,
    commits: node.commits?.totalCount ?? 0,
    approvedBy: (node.reviews?.nodes ?? [])
      .filter((review) => review.state === "APPROVED" && review.author?.login)
      .map((review) => review.author!.login as string),
    labels: (node.labels?.nodes ?? []).map((label) => label.name ?? "").filter(Boolean),
  };
}

/** Merged PRs authored by `login` in the org during `month`. `complete` is false whenever the data may be partial. */
export async function fetchMergedPrs(
  login: string,
  month: string,
  org: string,
  deps: GithubDeps
): Promise<{ prs: PullRequestFact[]; complete: boolean }> {
  if (!deps.token || !NAME_PATTERN.test(login) || !NAME_PATTERN.test(org) || !MONTH_PATTERN.test(month)) {
    return { prs: [], complete: false };
  }

  const q = `org:${org} is:pr is:merged author:${login} merged:${month}..${lastDayOf(month)}`;
  const prs: PullRequestFact[] = [];
  let after: string | null = null;

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const data: SearchData | null = await graphql<SearchData>(SEARCH_QUERY, { q, after }, deps);
    if (!data) return { prs: [], complete: false };

    for (const node of data.search.nodes) {
      const fact = toFact(node);
      if (fact) prs.push(fact);
    }
    if (!data.search.pageInfo.hasNextPage) return { prs, complete: true };
    after = data.search.pageInfo.endCursor;
  }

  return { prs, complete: false };
}

/** "missing" only when GitHub itself says the account does not exist; any other failure is "error". */
export async function verifyGithubLogin(login: string, deps: GithubDeps): Promise<"ok" | "missing" | "error"> {
  if (!NAME_PATTERN.test(login)) return "missing";
  if (!deps.token) return "error";
  try {
    const response = await (deps.fetchImpl ?? fetch)(`${API}/graphql`, {
      method: "POST",
      headers: headers(deps.token),
      body: JSON.stringify({ query: "query($login: String!) { user(login: $login) { login } }", variables: { login } }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) return "error";
    const body = (await response.json()) as { data?: { user?: { login?: string } | null }; errors?: { type?: string }[] };
    if (body.data?.user?.login) return "ok";
    if (body.errors?.length && body.errors.every((error) => error.type === "NOT_FOUND")) return "missing";
    return "error";
  } catch {
    return "error";
  }
}

/** The first commit's author is treated as the repo creator (cached by the caller). */
export async function fetchRepoCreator(
  repo: string,
  org: string,
  deps: GithubDeps
): Promise<{ creator: string | null; createdAt: string | null; ok: boolean }> {
  const failed = { creator: null, createdAt: null, ok: false };
  if (!deps.token || !REPO_PATTERN.test(repo) || repo === "." || repo === ".." || !NAME_PATTERN.test(org)) return failed;

  const meta = await rest(`/repos/${org}/${repo}`, deps);
  if (!meta) return failed;
  const createdAt = ((await meta.json()) as { created_at?: string }).created_at ?? null;

  const newest = await rest(`/repos/${org}/${repo}/commits?per_page=1`, deps);
  if (!newest) return failed;
  const link = newest.headers.get("Link");
  const lastPage = link?.match(/<[^>]*[?&]page=(\d+)[^>]*>;\s*rel="last"/)?.[1];

  const oldest = lastPage ? await rest(`/repos/${org}/${repo}/commits?per_page=1&page=${lastPage}`, deps) : newest;
  if (!oldest) return failed;
  const commits = (await oldest.json()) as { author?: { login?: string } | null }[];
  return { creator: commits[0]?.author?.login ?? null, createdAt, ok: true };
}

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface ReposData {
  organization: { repositories: { pageInfo: PageInfo; nodes: { name: string; createdAt: string }[] } } | null;
}

interface SearchData {
  search: { pageInfo: PageInfo; nodes: PrNode[] };
}

const REPOS_QUERY = `query($org: String!, $after: String) {
  organization(login: $org) {
    repositories(first: 100, after: $after, orderBy: { field: CREATED_AT, direction: DESC }) {
      pageInfo { hasNextPage endCursor }
      nodes { name createdAt }
    }
  }
}`;

export async function fetchOrgReposCreatedInMonth(
  org: string,
  month: string,
  deps: GithubDeps
): Promise<{ repos: { name: string; createdAt: string }[]; ok: boolean }> {
  if (!deps.token || !NAME_PATTERN.test(org) || !MONTH_PATTERN.test(month)) return { repos: [], ok: false };

  const from = `${month}T00:00:00Z`;
  const until = `${nextMonth(month)}T00:00:00Z`;
  const repos: { name: string; createdAt: string }[] = [];
  let after: string | null = null;

  for (let pageNumber = 0; pageNumber < MAX_PAGES; pageNumber += 1) {
    const data: ReposData | null = await graphql<ReposData>(REPOS_QUERY, { org, after }, deps);
    if (!data?.organization) return { repos: [], ok: false };

    const nodes: { name: string; createdAt: string }[] = data.organization.repositories.nodes;
    const pageInfo: PageInfo = data.organization.repositories.pageInfo;
    for (const node of nodes) {
      if (node.createdAt >= from && node.createdAt < until) repos.push(node);
    }
    const oldestOnPage = nodes[nodes.length - 1]?.createdAt;
    if (!pageInfo.hasNextPage || (oldestOnPage && oldestOnPage < from)) return { repos, ok: true };
    after = pageInfo.endCursor;
  }

  return { repos, ok: false };
}
