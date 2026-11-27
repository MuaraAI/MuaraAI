import type { PositionsConfig } from "@/lib/positions";

/**
 * The one definition of who is who: rank (hierarchy) + division + position (track).
 * The web, the member directory, the admin role editor and the GitHub team mapping all read this,
 * so there is no second list of roles anywhere.
 */
export const RANKS = ["maintainer", "head", "lead", "member"] as const;
export type Rank = (typeof RANKS)[number];
export type Division = "builder" | "creative";

const DIVISIONS: readonly Division[] = ["builder", "creative"];
const MAX_TRACK_LENGTH = 40;

export const isRank = (value: unknown): value is Rank => typeof value === "string" && (RANKS as readonly string[]).includes(value);
export const isDivision = (value: unknown): value is Division => typeof value === "string" && (DIVISIONS as readonly string[]).includes(value);

const DIVISION_NAMES: Record<Division, string> = { builder: "Builder", creative: "Creative" };

interface RoleSubject {
  hierarchy?: string | null;
  division?: string | null;
}

/** "Maintainer", "Head of Builder", "Creative Lead", "Member". */
export function roleLabel({ hierarchy, division }: RoleSubject): string {
  const name = isDivision(division) ? DIVISION_NAMES[division] : "";
  if (hierarchy === "maintainer") return "Maintainer";
  if (hierarchy === "head") return name ? `Head of ${name}` : "Head";
  if (hierarchy === "lead") return name ? `${name} Lead` : "Lead";
  return "Member";
}

/** The GitHub org teams a person belongs in (these slugs exist in the MuaraAI org today). */
export function teamSlugsFor({ hierarchy, division }: RoleSubject): string[] {
  const suffix = isDivision(division) ? division : "builder";
  if (hierarchy === "maintainer") return ["maintainers"];
  if (hierarchy === "head") return ["heads", `head-${suffix}`];
  if (hierarchy === "lead") return ["leads"];
  return ["members", `member-${suffix}`];
}

/** Groups people by rank in display order, drops empty ranks and sorts each group by name. */
export function groupByRank<T extends { hierarchy?: string | null; full_name: string }>(people: T[]): { rank: Rank; members: T[] }[] {
  return RANKS.map((rank) => ({
    rank,
    members: people.filter((person) => (isRank(person.hierarchy) ? person.hierarchy : "member") === rank).sort((a, b) => a.full_name.localeCompare(b.full_name)),
  })).filter((group) => group.members.length > 0);
}

export interface RoleChange {
  hierarchy: Rank;
  division: Division;
  track: string | null;
}

/** Checks an admin's role change against the lists; the position must be one of the official positions of that division. */
export function validateRoleChange(input: unknown, positions: PositionsConfig): { ok: true; value: RoleChange } | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Data peran tidak valid." };
  const { hierarchy, division, track } = input as Record<string, unknown>;
  if (!isRank(hierarchy)) return { ok: false, error: "Peringkat tidak dikenal." };
  if (!isDivision(division)) return { ok: false, error: "Divisi tidak dikenal." };

  const cleaned = typeof track === "string" ? track.trim() : "";
  if (cleaned.length > MAX_TRACK_LENGTH) return { ok: false, error: "Posisi tidak valid." };
  if (cleaned && !positions[division].includes(cleaned)) return { ok: false, error: "Posisi itu bukan posisi resmi divisi ini." };

  return { ok: true, value: { hierarchy, division, track: cleaned || null } };
}

/**
 * Database access treats someone as a maintainer when hierarchy is "maintainer" OR the legacy roles list
 * contains "maintainer". Changing only one of them would leave a demoted person as admin, so keep them in step.
 */
export function applyRole(roles: string[] | null | undefined, hierarchy: Rank): string[] {
  const current = roles ?? [];
  if (hierarchy !== "maintainer") return current.filter((role) => role !== "maintainer");
  return current.includes("maintainer") ? current : [...current, "maintainer"];
}
