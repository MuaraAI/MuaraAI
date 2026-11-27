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
import OnboardingView from "../src/components/auth/onboarding-view";

beforeEach(() => {
  user = null;
  positions = { builder: ["Web"], creative: ["Video"] };
  member = null;
});

describe("registration pages: sign in with GitHub first, then apply inside the dashboard", () => {
  it("sends a signed-out visitor to GitHub sign-in (English: to the explanation page first)", async () => {
    await expect(OnboardingPage()).rejects.toThrow("redirect:/api/auth/login");
    await expect(EnglishOnboardingPage()).rejects.toThrow("redirect:/en/join");
  });

  it("sends someone who is signed in but has not applied to the dashboard, where the form now lives", async () => {
    user = { id: "u1" };
    member = null;
    await expect(OnboardingPage()).rejects.toThrow("redirect:/dashboard");
    await expect(EnglishOnboardingPage()).rejects.toThrow("redirect:/dashboard");
  });

  it("sends pending and approved members to their dashboard", async () => {
    user = { id: "u1" };
    for (const status of ["pending", "approved"]) {
      member = { registration_status: status };
      await expect(OnboardingPage()).rejects.toThrow("redirect:/dashboard");
      await expect(EnglishOnboardingPage()).rejects.toThrow("redirect:/dashboard");
    }
  });

  it("still shows the form to a rejected applicant whose cooldown is over, and sends them to the dashboard while it runs", async () => {
    user = { id: "u1" };
    member = { registration_status: "rejected", full_name: "Budi", reviewed_at: new Date(Date.now() - 25 * 3600_000).toISOString(), rejection_reason: "Portofolio belum ada." };
    render(await OnboardingPage());
    expect(screen.getByRole("heading", { name: "Buat profil komunitasmu" })).toBeTruthy();
    expect(screen.getByText(/Portofolio belum ada/)).toBeTruthy();

    member = { registration_status: "rejected", reviewed_at: new Date().toISOString() };
    await expect(OnboardingPage()).rejects.toThrow("redirect:/dashboard");
  });
});

describe("the application form inside the dashboard", () => {
  it("renders the form in English for a signed-in applicant, without redirecting", async () => {
    user = { id: "u1" };
    member = null;
    render(await OnboardingView({ locale: "en", embedded: true }));
    expect(screen.getByRole("heading", { name: "Create your community profile" })).toBeTruthy();
    expect(screen.queryByText(/Buat profil/)).toBeNull();
  });

  it("renders it in Indonesian by default", async () => {
    user = { id: "u1" };
    render(await OnboardingView({ locale: "id", embedded: true }));
    expect(screen.getByRole("heading", { name: "Buat profil komunitasmu" })).toBeTruthy();
  });

  it("says registration is being prepared when the positions are missing, in either language", async () => {
    user = { id: "u1" };
    positions = null;
    const { unmount } = render(await OnboardingView({ locale: "en", embedded: true }));
    expect(screen.getByRole("heading", { name: "Registration is being prepared" })).toBeTruthy();
    expect(screen.getByText("The position list is not available yet. Please try again in a moment.")).toBeTruthy();
    unmount();
    render(await OnboardingView({ locale: "id", embedded: true }));
    expect(screen.getByRole("heading", { name: "Pendaftaran sedang disiapkan" })).toBeTruthy();
  });
});

describe("metadata of the registration pages", () => {
  it("is still a language pair", () => {
    expect(englishMetadata.alternates?.canonical).toBe("https://muaraai.com/en/onboarding");
    expect(englishMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding" });
    expect(indonesianMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding" });
    expect(String(englishMetadata.title)).toContain("Join MuaraAI");
  });
});
