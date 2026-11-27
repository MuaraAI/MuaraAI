import { DIVISIONS, teamSlugsFor, type RoleSubject } from "@/lib/structure";

/**
 * Keeps the MuaraAI GitHub org teams in step with the members table. This file only decides what should change
 * (pure functions); src/lib/github-org.ts talks to GitHub.
 *
 * The teams it manages are the rank teams and one head and one member team per division. Other teams (hackthon-1,
 * and "leads", which nothing fills yet) are never touched. People who are not in the members table yet are never
 * removed from anything: they simply have not registered on the web.
 */
export const MANAGED_TEAM_SLUGS: string[] = [
  "maintainers",
  "heads",
  ...DIVISIONS.map((division) => `head-${division}`),
  "members",
  ...DIVISIONS.map((division) => `member-${division}`),
];

/** username (lowercase) lists per team slug */
export type TeamMap = Record<string, string[]>;

export interface SyncPlan {
  create: { slug: string; parent: string }[];
  add: { team: string; user: string }[];
  remove: { team: string; user: string }[];
  /** People who are in a managed team on GitHub but not in the members table; left alone. */
  unknown: string[];
}

type TeamSubject = RoleSubject & {
  github_username?: string | null;
  registration_status?: string | null;
  membership_status?: string | null;
  is_active?: boolean | null;
};

/** Only approved, active members count; everyone else belongs in no team. */
export function desiredTeams(members: TeamSubject[]): TeamMap {
  const desired: TeamMap = Object.fromEntries(MANAGED_TEAM_SLUGS.map((slug) => [slug, [] as string[]]));
  for (const member of members) {
    const username = member.github_username?.trim().toLowerCase();
    if (!username || member.registration_status !== "approved" || member.membership_status !== "active" || member.is_active !== true) continue;
    for (const slug of teamSlugsFor(member)) if (slug in desired && !desired[slug].includes(username)) desired[slug].push(username);
  }
  return desired;
}

const parentOf = (slug: string) => (slug.startsWith("head-") ? "heads" : "members");

export function planTeamSync({ desired, current, known }: { desired: TeamMap; current: TeamMap; known: Set<string> }): SyncPlan {
  const plan: SyncPlan = { create: [], add: [], remove: [], unknown: [] };
  const unknown = new Set<string>();

  for (const slug of MANAGED_TEAM_SLUGS) {
    const want = new Set((desired[slug] ?? []).map((user) => user.toLowerCase()));
    if (!(slug in current) && (slug.startsWith("head-") || slug.startsWith("member-"))) plan.create.push({ slug, parent: parentOf(slug) });
    const have = new Set((current[slug] ?? []).map((user) => user.toLowerCase()));

    for (const user of want) if (!have.has(user)) plan.add.push({ team: slug, user });
    for (const user of have) {
      if (want.has(user)) continue;
      if (known.has(user)) plan.remove.push({ team: slug, user });
      else unknown.add(user);
    }
  }

  plan.unknown = [...unknown];
  return plan;
}
