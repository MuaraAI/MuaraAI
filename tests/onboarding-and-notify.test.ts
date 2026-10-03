import { describe, it, expect, vi } from "vitest";
import { validatePoWSubmission } from "../src/app/actions/pow";
import { notifyMaintainers } from "../src/lib/notify";

describe("Proof of Work Validation", () => {
  it("rejects empty portfolio link or narrative", () => {
    const invalid = validatePoWSubmission({
      fullName: "Test",
      portfolioUrl: "not-a-url",
      division: "builder",
      track: "web",
      toolchainNarrative: "short",
    });
    expect(invalid.isValid).toBe(false);
  });

  it("accepts valid submission", () => {
    const valid = validatePoWSubmission({
      fullName: "Test Builder",
      portfolioUrl: "https://github.com/test/repo",
      division: "builder",
      track: "web",
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
