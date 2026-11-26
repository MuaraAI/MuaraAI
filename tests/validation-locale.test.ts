import { describe, expect, it } from "vitest";
import { VALIDATION_MESSAGES, validatePoWSubmission, type PoWInput } from "../src/lib/validation";

const positions = { builder: ["Web", "Backend"], creative: ["Video"] };
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
const english = (override: Partial<PoWInput>) => validatePoWSubmission({ ...valid, ...override }, positions, "en").error;

describe("validation messages in English", () => {
  it("has exactly the same messages in both languages", () => {
    expect(Object.keys(VALIDATION_MESSAGES.en).sort()).toEqual(Object.keys(VALIDATION_MESSAGES.id).sort());
  });

  it("explains each kind of mistake in English", () => {
    expect(english({ fullName: "ab" })).toBe("Full name must be at least 3 characters.");
    expect(english({ affiliation: "robot" as never })).toBe("Choose your status: student, learner, general or other.");
    expect(english({ joinReason: "too short" })).toBe("Your reason for joining must be at least 50 characters.");
    expect(english({ track: "Game" })).toBe("Invalid position for the chosen division.");
    expect(english({ portfolioUrl: "ftp://x" })).toBe("The portfolio or repository link must be a valid URL (start with https://).");
    expect(english({ phoneWa: "123" })).toBe("An active WhatsApp number is required.");
    expect(english({ telegramUsername: "no" })).toBe("The Telegram username is not valid.");
    expect(english({ secondaryDivision: "builder", secondaryTrack: "Web" })).toBe("The second division must differ from the main division.");
    expect(english({ fullName: "x".repeat(101) })).toBe("Full name can be at most 100 characters.");
    expect(validatePoWSubmission({ ...valid, fullName: 5 as never }, positions, "en").error).toBe("The registration data is not valid.");
  });

  it("stays Indonesian by default and for a language it does not know", () => {
    expect(validatePoWSubmission({ ...valid, fullName: "ab" }, positions).error).toBe("Nama lengkap minimal 3 karakter.");
    expect(validatePoWSubmission({ ...valid, fullName: "ab" }, positions, "fr" as never).error).toBe("Nama lengkap minimal 3 karakter.");
  });

  it("accepts the same valid input in both languages", () => {
    expect(validatePoWSubmission(valid, positions, "en")).toEqual({ isValid: true });
  });
});
