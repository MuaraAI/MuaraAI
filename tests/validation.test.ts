import { describe, expect, it } from "vitest";
import { validatePoWSubmission, MIN_JOIN_REASON_LENGTH, type PoWInput } from "../src/lib/validation";

const positions = { builder: ["Web", "Backend"], creative: ["Video", "Copywriting"] };

const valid: PoWInput = {
  fullName: "Budi Santoso",
  affiliation: "umum",
  institution: "",
  phoneWa: "081234567890",
  telegramUsername: "",
  division: "builder",
  track: "Web",
  joinReason: "x".repeat(50),
  portfolioUrl: "https://github.com/budi/repo",
  toolchainNarrative: "Next.js, Supabase, dan Cursor.",
};

const check = (override: Partial<PoWInput>) => validatePoWSubmission({ ...valid, ...override }, positions);

describe("validatePoWSubmission (open global intake)", () => {
  it("accepts a complete submission without NIM, campus, or class", () => {
    expect(check({})).toEqual({ isValid: true });
  });

  it("requires at least 50 characters of join reason after trimming", () => {
    expect(MIN_JOIN_REASON_LENGTH).toBe(50);
    expect(check({ joinReason: "x".repeat(49) })).toEqual({
      isValid: false,
      error: "Alasan bergabung minimal 50 karakter.",
    });
    expect(check({ joinReason: `  ${"x".repeat(49)}  ` }).isValid).toBe(false);
    expect(check({ joinReason: `  ${"x".repeat(50)}  ` }).isValid).toBe(true);
  });

  it("rejects a position outside the division's list", () => {
    expect(check({ track: "Game" })).toEqual({
      isValid: false,
      error: "Posisi tidak valid untuk divisi yang dipilih.",
    });
    expect(check({ division: "creative", track: "Web" }).isValid).toBe(false);
    expect(check({ division: "creative", track: "Video" }).isValid).toBe(true);
  });

  it("validates the optional secondary division", () => {
    expect(check({ secondaryDivision: "creative", secondaryTrack: "Video" }).isValid).toBe(true);
    expect(check({ secondaryDivision: "builder", secondaryTrack: "Backend" })).toEqual({
      isValid: false,
      error: "Divisi kedua harus berbeda dari divisi utama.",
    });
    expect(check({ secondaryTrack: "Video" }).isValid).toBe(false);
    expect(check({ secondaryDivision: "creative" }).isValid).toBe(false);
    expect(check({ secondaryDivision: "creative", secondaryTrack: "Web" }).isValid).toBe(false);
  });

  it("rejects an affiliation outside the allowed list", () => {
    expect(check({ affiliation: "alien" as never }).isValid).toBe(false);
    for (const affiliation of ["mahasiswa", "pelajar", "umum", "lainnya"] as const) {
      expect(check({ affiliation }).isValid).toBe(true);
    }
  });

  it("requires a WhatsApp number but treats Telegram as optional", () => {
    expect(check({ phoneWa: "" })).toEqual({ isValid: false, error: "Nomor WhatsApp aktif wajib diisi." });
    expect(check({ phoneWa: "08123" }).isValid).toBe(false);
    expect(check({ telegramUsername: "" }).isValid).toBe(true);
    expect(check({ telegramUsername: "@budi_dev1" }).isValid).toBe(true);
    expect(check({ telegramUsername: "budi_dev1" }).isValid).toBe(true);
    expect(check({ telegramUsername: "ab" })).toEqual({ isValid: false, error: "Username Telegram tidak valid." });
    expect(check({ telegramUsername: "budi dev" }).isValid).toBe(false);
  });

  it("rejects over-long text instead of storing it", () => {
    expect(check({ fullName: "x".repeat(101) })).toEqual({ isValid: false, error: "Nama lengkap maksimal 100 karakter." });
    expect(check({ joinReason: "x".repeat(2001) })).toEqual({ isValid: false, error: "Alasan bergabung maksimal 2000 karakter." });
    expect(check({ institution: "x".repeat(151) }).isValid).toBe(false);
    expect(check({ toolchainNarrative: "x".repeat(2001) }).isValid).toBe(false);
    expect(check({ portfolioUrl: `https://github.com/${"x".repeat(500)}` }).isValid).toBe(false);
    expect(check({ joinReason: "x".repeat(2000) }).isValid).toBe(true);
  });

  it("does not throw on non-string input", () => {
    expect(check({ fullName: 123 as never }).isValid).toBe(false);
    expect(check({ joinReason: null as never }).isValid).toBe(false);
    expect(check({ phoneWa: 8123456789 as never }).isValid).toBe(false);
    expect(check({ institution: 5 as never }).isValid).toBe(false);
  });

  it("keeps the basic name, portfolio, and toolchain checks", () => {
    expect(check({ fullName: "Bu" }).isValid).toBe(false);
    expect(check({ portfolioUrl: "github.com/budi" }).isValid).toBe(false);
    expect(check({ websiteUrl: "budi.dev" }).isValid).toBe(false);
    expect(check({ toolchainNarrative: "terlalu pendek" }).isValid).toBe(false);
  });
});
