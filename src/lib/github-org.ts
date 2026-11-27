import { MANAGED_TEAM_SLUGS, type TeamMap } from "@/lib/github-teams";

/** Thin GitHub REST client for the MuaraAI org's teams. It never puts the token in an error message. */
const API = "https://api.github.com";
const ORG = "MuaraAI";
const TIMEOUT_MS = 15_000;
// ponytail: one page of 100 per team (we are nowhere near that); add paging if a team ever grows past it.
const PAGE = 100;

const headers = (token: string): Record<string, string> => ({
  Authorization: `Bearer ${token}`,
  Accept: "application/vnd.github+json",
  "X-GitHub-Api-Version": "2022-11-28",
  "User-Agent": "MuaraAI-Web-Portal",
  "Content-Type": "application/json",
});

async function request(token: string, path: string, init: { method?: string; body?: unknown } = {}): Promise<Response> {
  const response = await fetch(`${API}${path}`, {
    method: init.method ?? "GET",
    headers: headers(token),
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!response.ok) throw new Error(`GitHub ${init.method ?? "GET"} ${path} failed: HTTP ${response.status}`);
  return response;
}

/** Members (lowercase) of each managed team that exists, plus the team ids (needed as a parent when creating teams). */
export async function fetchOrgTeams(token: string): Promise<{ teams: TeamMap; ids: Record<string, number> }> {
  const list = (await (await request(token, `/orgs/${ORG}/teams?per_page=${PAGE}`)).json()) as { slug: string; id: number }[];
  const existing = list.filter((team) => MANAGED_TEAM_SLUGS.includes(team.slug));

  const entries = await Promise.all(
    existing.map(async (team) => {
      const members = (await (await request(token, `/orgs/${ORG}/teams/${encodeURIComponent(team.slug)}/members?per_page=${PAGE}`)).json()) as { login: string }[];
      return [team.slug, members.map((member) => member.login.toLowerCase())] as const;
    }),
  );

  return { teams: Object.fromEntries(entries), ids: Object.fromEntries(existing.map((team) => [team.slug, team.id])) };
}

export async function createTeam(token: string, slug: string, parentId: number): Promise<number> {
  const response = await request(token, `/orgs/${ORG}/teams`, { method: "POST", body: { name: slug, privacy: "closed", parent_team_id: parentId } });
  return ((await response.json()) as { id: number }).id;
}

export async function addTeamMember(token: string, team: string, user: string): Promise<void> {
  await request(token, `/orgs/${ORG}/teams/${encodeURIComponent(team)}/memberships/${encodeURIComponent(user)}`, { method: "PUT", body: { role: "member" } });
}

export async function removeTeamMember(token: string, team: string, user: string): Promise<void> {
  await request(token, `/orgs/${ORG}/teams/${encodeURIComponent(team)}/memberships/${encodeURIComponent(user)}`, { method: "DELETE" });
}
