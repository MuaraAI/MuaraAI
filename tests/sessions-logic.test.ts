import { describe, expect, it } from "vitest";
import {
  attendanceSummary,
  formatWib,
  generateCode,
  isSessionOpen,
  isoToWibInput,
  nextFridayDefault,
  normalizeCode,
  validateSessionInput,
  wibToIso,
} from "../src/lib/sessions/sessions";

const valid = {
  title: "  Sharing PR pertama  ",
  type: "sharing",
  materi: "  Cara membuka PR  ",
  startsAt: "2026-12-04T12:30:00.000Z",
  endsAt: "2026-12-04T15:00:00.000Z",
  discordUrl: "https://discord.gg/muaraai",
};

describe("validateSessionInput", () => {
  it("accepts a valid session and trims the text", () => {
    const result = validateSessionInput(valid);
    expect(result).toEqual({ ok: true, value: { ...valid, title: "Sharing PR pertama", materi: "Cara membuka PR" } });
  });

  it("rejects empty or oversized text, unknown types and non-objects", () => {
    expect(validateSessionInput({ ...valid, title: "   " }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, title: "a".repeat(121) }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, materi: "a".repeat(2001) }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, type: "party" }).ok).toBe(false);
    for (const bad of [null, undefined, "x", 7, []]) expect(validateSessionInput(bad).ok).toBe(false);
  });

  it("rejects bad times and durations beyond 12 hours", () => {
    expect(validateSessionInput({ ...valid, endsAt: valid.startsAt }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, endsAt: "2026-12-04T12:00:00.000Z" }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, startsAt: "bukan tanggal" }).ok).toBe(false);
    expect(validateSessionInput({ ...valid, endsAt: "2026-12-05T00:30:00.000Z" }).ok).toBe(true);
    expect(validateSessionInput({ ...valid, endsAt: "2026-12-05T00:31:00.000Z" }).ok).toBe(false);
  });

  it("only accepts https links to Discord hosts", () => {
    for (const ok of ["https://DISCORD.GG/abc", "https://discord.com/channels/1/2", "https://www.discord.com/x"]) {
      expect(validateSessionInput({ ...valid, discordUrl: ok }).ok).toBe(true);
    }
    for (const bad of [
      "http://discord.com/x",
      "https://discord.com.evil.com",
      "https://discord.com@evil.com",
      "https://evil.com/discord.gg",
      "javascript:alert(1)",
      "discord.gg/abc",
      "",
    ]) {
      expect(validateSessionInput({ ...valid, discordUrl: bad }).ok).toBe(false);
    }
  });
});

describe("generateCode / normalizeCode", () => {
  it("maps bytes onto the alphabet and skips biased bytes", () => {
    expect(generateCode(() => Uint8Array.from([0, 1, 2, 3, 4, 5]))).toBe("ABCDEF");
    expect(generateCode(() => Uint8Array.from([255, 0, 1, 2, 3, 4, 5, 6]))).toBe("ABCDEF");
  });

  it("always makes 6 characters from the alphabet", () => {
    for (let i = 0; i < 50; i += 1) expect(generateCode()).toMatch(/^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/);
  });

  it("normalizes spaces, dashes and case, and rejects anything else", () => {
    expect(normalizeCode("ab c-d23")).toBe("ABCD23");
    for (const bad of ["ABC", "ABCDEFG", "ABCDE0", "ABCDEI", 123, null, undefined, {}, ""]) {
      expect(normalizeCode(bad)).toBeNull();
    }
  });
});

describe("isSessionOpen", () => {
  const session = { startsAt: "2026-12-04T12:30:00.000Z", endsAt: "2026-12-04T15:00:00.000Z" };
  const at = (iso: string) => new Date(iso);

  it("opens 15 minutes before the start and closes exactly at the end (inclusive)", () => {
    expect(isSessionOpen(session, at("2026-12-04T12:15:00.000Z"))).toBe(true);
    expect(isSessionOpen(session, at("2026-12-04T12:14:59.999Z"))).toBe(false);
    expect(isSessionOpen(session, at("2026-12-04T15:00:00.000Z"))).toBe(true);
    expect(isSessionOpen(session, at("2026-12-04T15:00:00.001Z"))).toBe(false);
  });
});

describe("WIB helpers", () => {
  it("converts WIB input to UTC and back", () => {
    expect(wibToIso("2026-12-04T19:30")).toBe("2026-12-04T12:30:00.000Z");
    expect(wibToIso("2026-12-01T00:30")).toBe("2026-11-30T17:30:00.000Z");
    expect(isoToWibInput("2026-12-04T12:30:00.000Z")).toBe("2026-12-04T19:30");
    expect(isoToWibInput(wibToIso("2026-12-31T23:59")!)).toBe("2026-12-31T23:59");
  });

  it("rejects malformed or impossible input", () => {
    for (const bad of ["garbage", "2026-02-30T10:00", "2026-12-04T25:00", "2026-12-04 19:30", ""]) {
      expect(wibToIso(bad)).toBeNull();
    }
  });

  it("formats a time in WIB", () => {
    const text = formatWib("2026-12-04T12:30:00.000Z");
    expect(text).toContain("19.30 WIB");
    expect(text).toContain("2026");
  });

  it("picks the upcoming Friday 19:30-22:00 WIB", () => {
    const friday = { start: "2026-12-04T19:30", end: "2026-12-04T22:00" };
    const nextFriday = { start: "2026-12-11T19:30", end: "2026-12-11T22:00" };
    expect(nextFridayDefault(new Date("2026-12-03T10:00:00Z"))).toEqual(friday); // Thursday
    expect(nextFridayDefault(new Date("2026-12-03T19:00:00Z"))).toEqual(friday); // Friday 02:00 WIB
    expect(nextFridayDefault(new Date("2026-12-04T11:00:00Z"))).toEqual(friday); // Friday 18:00 WIB
    expect(nextFridayDefault(new Date("2026-12-04T15:01:00Z"))).toEqual(nextFriday); // Friday 22:01 WIB
    expect(nextFridayDefault(new Date("2026-12-05T05:00:00Z"))).toEqual(nextFriday); // Saturday
  });
});

describe("attendanceSummary", () => {
  const ids = ["s5", "s4", "s3", "s2", "s1"];

  it("is all zeros without ended sessions", () => {
    expect(attendanceSummary([], new Set())).toEqual({ attended: 0, total: 0, streak: 0 });
  });

  it("counts a full streak when every session was attended", () => {
    expect(attendanceSummary(ids, new Set(ids))).toEqual({ attended: 5, total: 5, streak: 5 });
  });

  it("stops the streak at the first missed session", () => {
    expect(attendanceSummary(ids, new Set(["s5", "s4", "s2", "s1"]))).toEqual({ attended: 4, total: 5, streak: 2 });
    expect(attendanceSummary(ids, new Set(["s4", "s3"]))).toEqual({ attended: 2, total: 5, streak: 0 });
  });

  it("limits the shown window but not the streak", () => {
    expect(attendanceSummary(ids, new Set(ids), 2)).toEqual({ attended: 2, total: 2, streak: 5 });
  });
});
