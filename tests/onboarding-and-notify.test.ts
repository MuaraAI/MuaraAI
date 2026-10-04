import { describe, it, expect, vi } from "vitest";
import { validatePoWSubmission } from "../src/lib/validation";
import { notifyMaintainers } from "../src/lib/notify";

describe("Proof of Work Validation", () => {
  it("rejects invalid NIM format (non-8 digits)", () => {
    const invalid = validatePoWSubmission({
      fullName: "Test Student",
      nim: "12345", // not 8 digits
      campus: "UBSI Pontianak",
      prodi: "Informatika (S1)",
      kelas: "15.1C.30",
      phoneWa: "081234567890",
      portfolioUrl: "https://github.com/test/repo",
      division: "builder",
      track: "web",
      toolchainNarrative: "I build with Next.js, Claude Code, and test with Vitest.",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain("8 digit angka resmi UBSI");
  });

  it("rejects empty campus or missing kelas", () => {
    const invalid = validatePoWSubmission({
      fullName: "Test Student",
      nim: "15260767",
      campus: "",
      prodi: "Informatika (S1)",
      kelas: "",
      phoneWa: "081234567890",
      portfolioUrl: "https://github.com/test/repo",
      division: "builder",
      track: "web",
      toolchainNarrative: "I build with Next.js, Claude Code, and test with Vitest.",
    });
    expect(invalid.isValid).toBe(false);
    expect(invalid.error).toContain("Pilih kampus asal UBSI Anda");
  });

  it("accepts valid UBSI student submission", () => {
    const valid = validatePoWSubmission({
      fullName: "Yuken Velino",
      nim: "15260767",
      campus: "UBSI Pontianak",
      prodi: "Informatika (S1)",
      kelas: "15.1C.30",
      phoneWa: "081234567890",
      portfolioUrl: "https://github.com/test/repo",
      division: "builder",
      track: "Web & Apps Systems",
      toolchainNarrative: "I build with Next.js, Claude Code, and test with Vitest.",
    });
    expect(valid.isValid).toBe(true);
  });
});

describe("Maintainer Notification Dispatcher", () => {
  it("handles missing webhook variables gracefully without throwing", async () => {
    // Should resolve without unhandled exceptions
    await expect(notifyMaintainers("Test Title", "Test Message")).resolves.not.toThrow();
  });
});
