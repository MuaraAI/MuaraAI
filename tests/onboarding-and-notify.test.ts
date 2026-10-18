import { describe, it, expect, vi } from "vitest";
import { validatePoWSubmission } from "../src/lib/validation";
import { notifyMaintainers } from "../src/lib/notify";

describe("Proof of Work Validation", () => {
  it("rejects a NIM that is not numeric or too short", () => {
    const invalid = validatePoWSubmission({
      fullName: "Test Student",
      nim: "123", // below the 4-digit floor
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
    expect(invalid.error).toContain("NIM wajib");
  });

  it("rejects empty campus even when kelas is not provided", () => {
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
    expect(invalid.error).toContain("Pilih kampus atau institusi asal Anda");
  });

  it("accepts a UBSI student submission with a class code", () => {
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

  it("accepts a national applicant from another campus without a class code", () => {
    const valid = validatePoWSubmission({
      fullName: "Sari National",
      nim: "1023109876", // 10-digit NIM, non-UBSI campus
      campus: "Universitas Indonesia",
      prodi: "Ilmu Komputer",
      phoneWa: "081234567890",
      portfolioUrl: "https://github.com/test/repo",
      division: "creative",
      track: "Media & Motion",
      toolchainNarrative: "I ship Blender and After Effects pipelines with Blender MCP.",
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
