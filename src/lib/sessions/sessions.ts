import type { Locale } from "@/lib/locale";
import { DATE_LOCALE } from "@/lib/portal-copy";

export const SESSION_TYPES = ["diskusi", "sharing", "modul", "aturan_github", "random", "lainnya"] as const;
export type SessionType = (typeof SESSION_TYPES)[number];

export const SESSION_TYPE_LABELS: Record<SessionType, string> = {
  diskusi: "Diskusi",
  sharing: "Sharing",
  modul: "Modul",
  aturan_github: "Aturan GitHub",
  random: "Random",
  lainnya: "Lainnya",
};

export interface SessionInput {
  title: string;
  type: SessionType;
  materi: string;
  /** ISO 8601 UTC. */
  startsAt: string;
  endsAt: string;
  discordUrl: string;
}

const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
const CODE_LENGTH = 6;
/** Largest multiple of the alphabet size that fits in a byte: bytes above it would bias the draw. */
const UNBIASED_LIMIT = 248;
const WIB_OFFSET_MS = 7 * 3_600_000;
const EARLY_CHECKIN_MS = 15 * 60_000;
const MAX_DURATION_MS = 12 * 3_600_000;
const DISCORD_HOSTS = ["discord.gg", "discord.com", "www.discord.com"];
const pad = (value: number) => String(value).padStart(2, "0");

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isDiscordUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.username === "" && url.password === "" && DISCORD_HOSTS.includes(url.hostname);
  } catch {
    return false;
  }
}

export function validateSessionInput(input: unknown): { ok: true; value: SessionInput } | { ok: false; error: string } {
  if (!isRecord(input)) return { ok: false, error: "Data sesi tidak valid." };

  const title = typeof input.title === "string" ? input.title.trim() : "";
  if (title.length < 1 || title.length > 120) return { ok: false, error: "Judul harus 1–120 karakter." };

  if (!SESSION_TYPES.includes(input.type as SessionType)) return { ok: false, error: "Tipe sesi tidak valid." };

  const materi = typeof input.materi === "string" ? input.materi.trim() : "";
  if (materi.length > 2000) return { ok: false, error: "Materi maksimal 2000 karakter." };

  const starts = typeof input.startsAt === "string" ? Date.parse(input.startsAt) : NaN;
  const ends = typeof input.endsAt === "string" ? Date.parse(input.endsAt) : NaN;
  if (Number.isNaN(starts) || Number.isNaN(ends)) return { ok: false, error: "Jadwal sesi tidak valid." };
  if (ends <= starts) return { ok: false, error: "Jam selesai harus setelah jam mulai." };
  if (ends - starts > MAX_DURATION_MS) return { ok: false, error: "Durasi sesi maksimal 12 jam." };

  const discordUrl = typeof input.discordUrl === "string" ? input.discordUrl.trim() : "";
  if (!isDiscordUrl(discordUrl)) return { ok: false, error: "Link Discord harus https dari discord.gg atau discord.com." };

  return {
    ok: true,
    value: {
      title,
      type: input.type as SessionType,
      materi,
      startsAt: new Date(starts).toISOString(),
      endsAt: new Date(ends).toISOString(),
      discordUrl,
    },
  };
}

const defaultRandomBytes = (size: number) => crypto.getRandomValues(new Uint8Array(size));

/** A 6-character code from an unambiguous alphabet, drawn without modulo bias. */
export function generateCode(randomBytes: (size: number) => Uint8Array = defaultRandomBytes): string {
  let code = "";
  while (code.length < CODE_LENGTH) {
    for (const byte of randomBytes(CODE_LENGTH * 2)) {
      if (byte >= UNBIASED_LIMIT) continue;
      code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
      if (code.length === CODE_LENGTH) break;
    }
  }
  return code;
}

/** Trims, upper-cases and strips spaces and dashes; null unless exactly a valid 6-character code. */
export function normalizeCode(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const code = raw.replace(/[\s-]/g, "").toUpperCase();
  return code.length === CODE_LENGTH && [...code].every((char) => CODE_ALPHABET.includes(char)) ? code : null;
}

/** Check-in is possible from 15 minutes before the start until the end (inclusive). */
export function isSessionOpen(session: { startsAt: string; endsAt: string }, now: Date): boolean {
  const time = now.getTime();
  return time >= Date.parse(session.startsAt) - EARLY_CHECKIN_MS && time <= Date.parse(session.endsAt);
}

/** "2026-12-04T19:30" (WIB wall clock, as in a datetime-local input) to an ISO UTC string. */
export function wibToIso(local: string): string | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
  if (!match) return null;
  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const wall = new Date(Date.UTC(year, month - 1, day, hour, minute));
  const exact =
    wall.getUTCFullYear() === year &&
    wall.getUTCMonth() === month - 1 &&
    wall.getUTCDate() === day &&
    wall.getUTCHours() === hour &&
    wall.getUTCMinutes() === minute;
  return exact ? new Date(wall.getTime() - WIB_OFFSET_MS).toISOString() : null;
}

/** The inverse of `wibToIso`: an ISO UTC string as a WIB `datetime-local` value. */
export function isoToWibInput(iso: string): string {
  return new Date(Date.parse(iso) + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

/** The upcoming Friday 19:30-22:00 WIB (today when 22:00 has not passed yet), as WIB input strings. */
export function nextFridayDefault(now: Date): { start: string; end: string } {
  const wib = new Date(now.getTime() + WIB_OFFSET_MS);
  const minutes = wib.getUTCHours() * 60 + wib.getUTCMinutes();
  let daysAhead = (5 - wib.getUTCDay() + 7) % 7;
  if (daysAhead === 0 && minutes > 22 * 60) daysAhead = 7;

  const day = new Date(Date.UTC(wib.getUTCFullYear(), wib.getUTCMonth(), wib.getUTCDate() + daysAhead)).toISOString().slice(0, 10);
  return { start: `${day}T19:30`, end: `${day}T22:00` };
}

/** "Jumat, 4 Des 2026 · 19.30 WIB". */
export function formatWib(iso: string, locale: Locale = "id"): string {
  const wib = new Date(Date.parse(iso) + WIB_OFFSET_MS);
  const date = wib.toLocaleDateString(DATE_LOCALE[locale], { weekday: "long", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${date} · ${pad(wib.getUTCHours())}.${pad(wib.getUTCMinutes())} WIB`;
}

/** Attendance over the latest `window` ended sessions; the streak runs over the whole list. */
export function attendanceSummary(
  endedSessionIdsNewestFirst: string[],
  attended: ReadonlySet<string>,
  window = 8
): { attended: number; total: number; streak: number } {
  const recent = endedSessionIdsNewestFirst.slice(0, window);
  let streak = 0;
  for (const id of endedSessionIdsNewestFirst) {
    if (!attended.has(id)) break;
    streak += 1;
  }
  return { attended: recent.filter((id) => attended.has(id)).length, total: recent.length, streak };
}
