import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

let user: { id: string; user_metadata?: Record<string, string> } | null = null;
let positions: unknown = { builder: ["Web"], creative: ["Video"] };
let member: unknown = null;

vi.mock("next/navigation", () => ({
  redirect: (path: string) => {
    throw new Error(`redirect:${path}`);
  },
}));
vi.mock("@/app/actions/pow", () => ({ submitProofOfWork: vi.fn() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user } }) },
    from: () => ({ select: () => ({ eq: () => ({ single: async () => ({ data: positions ? { value: positions } : null }) }) }) }),
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createPrivilegedClient: async () => ({ from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: member }) }) }) }) }),
}));

import EnglishOnboardingPage, { metadata as englishMetadata } from "../src/app/(english)/en/onboarding/page";
import OnboardingPage, { metadata as indonesianMetadata } from "../src/app/(public)/onboarding/page";

beforeEach(() => {
  user = null;
  positions = { builder: ["Web"], creative: ["Video"] };
  member = null;
});

describe("English registration page", () => {
  it("renders the form in English for a visitor", async () => {
    render(await EnglishOnboardingPage());
    expect(screen.getByRole("heading", { name: "Create your community profile" })).toBeTruthy();
    expect(screen.queryByText(/Buat profil/)).toBeNull();
  });

  it("says in English that registration is being prepared when the positions are missing", async () => {
    positions = null;
    render(await EnglishOnboardingPage());
    expect(screen.getByRole("heading", { name: "Registration is being prepared" })).toBeTruthy();
    expect(screen.getByText("The position list is not available yet. Please try again in a moment.")).toBeTruthy();
  });

  it("sends pending and approved members to their dashboard, like the Indonesian page", async () => {
    user = { id: "u1" };
    for (const status of ["pending", "approved"]) {
      member = { registration_status: status };
      await expect(EnglishOnboardingPage()).rejects.toThrow("redirect:/dashboard");
    }
  });

  it("is searchable in both languages", () => {
    expect(englishMetadata.alternates?.canonical).toBe("https://muaraai.com/en/onboarding");
    expect(englishMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding" });
    expect(indonesianMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding" });
    expect(String(englishMetadata.title)).toContain("Join MuaraAI");
  });
});

describe("Indonesian registration page", () => {
  it("is unchanged", async () => {
    render(await OnboardingPage());
    expect(screen.getByRole("heading", { name: "Buat profil komunitasmu" })).toBeTruthy();
  });

  it("still shows the Indonesian notice when the positions are missing", async () => {
    positions = null;
    render(await OnboardingPage());
    expect(screen.getByRole("heading", { name: "Pendaftaran sedang disiapkan" })).toBeTruthy();
  });
});
