import { isMaintainer } from "@/lib/guards";
import type { PositionsConfig } from "@/lib/positions";

/**
 * The one definition of who is who. A person can be a maintainer, lead any number of divisions (Head of X),
 * belong to several divisions and hold several positions. The web, the member directory, the admin role editor
 * and the GitHub team mapping all read this, so there is no second list of roles anywhere.
 */
export const DIVISIONS = ["builder", "creative", "cybersecurity"] as const;
export type Division = (typeof DIVISIONS)[number];
export const RANKS = ["maintainer", "head", "lead", "member"] as const;
export type Rank = (typeof RANKS)[number];

export const DIVISION_NAMES: Record<Division, string> = { builder: "Builder", creative: "Creative", cybersecurity: "Cybersecurity" };
const MAX_TRACK_LENGTH = 40;

export const isDivision = (value: unknown): value is Division => typeof value === "string" && (DIVISIONS as readonly string[]).includes(value);
export const isRank = (value: unknown): value is Rank => typeof value === "string" && (RANKS as readonly string[]).includes(value);

export interface RoleSubject {
  hierarchy?: string | null;
  roles?: string[] | null;
  titles?: string[] | null;
  division?: string | null;
  divisions?: string[] | null;
  head_of?: string[] | null;
}

const onlyDivisions = (values: unknown): Division[] => (Array.isArray(values) ? [...new Set(values.filter(isDivision))] : []);

/** Every division a person belongs to; rows from before the divisions list existed fall back to their primary division. */
export function divisionsOf(person: RoleSubject): Division[] {
  const listed = onlyDivisions(person.divisions);
  if (listed.length > 0) return listed;
  return isDivision(person.division) ? [person.division] : [];
}

export function headOf(person: RoleSubject): Division[] {
  return onlyDivisions(person.head_of);
}

/** Titles that are worked out from the data (Maintainer, Head of X) are never taken from the free-text titles list. */
const isDerivedTitle = (title: string) => /^(maintainer|head of .+)$/i.test(title.trim());

/** "Founder", "Maintainer", "Head of Builder": honorific first, then access, then each division they lead. */
export function roleBadges(person: RoleSubject): string[] {
  const honorifics = [...new Set((person.titles ?? []).map((title) => title.trim()).filter((title) => title && !isDerivedTitle(title)))];
  return [
    ...honorifics,
    ...(isMaintainer(person) ? ["Maintainer"] : []),
    ...headOf(person).map((division) => `Head of ${DIVISION_NAMES[division]}`),
  ];
}

/** The GitHub org teams a person belongs in (these slugs exist in the MuaraAI org, plus the two Cybersecurity ones to create). */
export function teamSlugsFor(person: RoleSubject): string[] {
  const heads = headOf(person);
  return [
    ...(isMaintainer(person) ? ["maintainers"] : []),
    ...(heads.length > 0 ? ["heads", ...heads.map((division) => `head-${division}`)] : []),
    ...(person.hierarchy === "lead" ? ["leads"] : []),
    ...(divisionsOf(person).length > 0 ? ["members", ...divisionsOf(person).map((division) => `member-${division}`)] : []),
  ];
}

export interface RoleChange {
  maintainer: boolean;
  divisions: Division[];
  primary: Division;
  headOf: Division[];
  tracks: string[];
}

type Validated = { ok: true; value: RoleChange } | { ok: false; error: string };

/** The official positions of a division; a division without any (e.g. Cybersecurity before they are set up) has an empty list. */
export const positionsOf = (positions: PositionsConfig, division: Division): string[] => positions[division] ?? [];

/** Checks an admin's change against the lists: every division, head role and position must be a real one, and consistent with each other. */
export function validateRoleChange(input: unknown, positions: PositionsConfig): Validated {
  if (!input || typeof input !== "object") return { ok: false, error: "Data peran tidak valid." };
  const raw = input as Record<string, unknown>;

  if (typeof raw.maintainer !== "boolean") return { ok: false, error: "Data peran tidak valid." };
  if (!Array.isArray(raw.divisions) || !raw.divisions.every(isDivision)) return { ok: false, error: "Divisi tidak dikenal." };
  const divisions = onlyDivisions(raw.divisions);
  if (divisions.length === 0) return { ok: false, error: "Pilih minimal satu divisi." };
  if (!isDivision(raw.primary) || !divisions.includes(raw.primary)) return { ok: false, error: "Divisi utama harus salah satu divisi anggota." };

  if (!Array.isArray(raw.headOf) || !raw.headOf.every(isDivision)) return { ok: false, error: "Divisi yang dipimpin tidak dikenal." };
  const heads = onlyDivisions(raw.headOf);
  if (heads.some((division) => !divisions.includes(division))) return { ok: false, error: "Head harus anggota divisi yang dipimpinnya." };

  if (!Array.isArray(raw.tracks) || !raw.tracks.every((track) => typeof track === "string")) return { ok: false, error: "Posisi tidak valid." };
  const tracks = [...new Set((raw.tracks as string[]).map((track) => track.trim()).filter(Boolean))];
  const official = new Set(divisions.flatMap((division) => positionsOf(positions, division)));
  if (tracks.some((track) => track.length > MAX_TRACK_LENGTH || !official.has(track))) {
    return { ok: false, error: "Posisi itu bukan posisi resmi dari divisi anggota ini." };
  }

  return { ok: true, value: { maintainer: raw.maintainer, divisions, primary: raw.primary, headOf: heads, tracks } };
}

/**
 * Database access treats someone as a maintainer when hierarchy is "maintainer" OR the legacy roles list
 * contains "maintainer". Changing only one of them would leave a demoted person as admin, so keep them in step,
 * and keep the legacy head-<division> entries in step with head_of too.
 */
export function applyRole(roles: string[] | null | undefined, { maintainer, headOf: heads }: { maintainer: boolean; headOf: Division[] }): string[] {
  const kept = (roles ?? []).filter((role) => role !== "maintainer" && !role.startsWith("head-"));
  return [...kept, ...(maintainer ? ["maintainer"] : []), ...heads.map((division) => `head-${division}`)];
}

/** The legacy single rank, worked out from the new fields so older code that reads hierarchy keeps working. */
export function hierarchyFor(current: string | null | undefined, { maintainer, headOf: heads }: { maintainer: boolean; headOf: Division[] }): Rank {
  if (maintainer) return "maintainer";
  if (heads.length > 0) return "head";
  return current === "lead" ? "lead" : "member";
}
