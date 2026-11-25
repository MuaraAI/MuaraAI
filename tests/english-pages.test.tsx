import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import React from "react";

let configured = true;
let settings: Record<string, unknown> = {};

vi.mock("next/navigation", () => ({ usePathname: () => "/en" }));
vi.mock("@/lib/supabase/server", () => ({
  isSupabaseConfigured: () => configured,
  createClient: async () => ({
    from: () => ({
      select: () => ({
        eq: (_column: string, key: string) => ({ maybeSingle: async () => ({ data: key in settings ? { value: settings[key] } : null }) }),
      }),
    }),
    auth: { getUser: async () => ({ data: { user: null } }) },
  }),
}));

import EnglishHomePage, { metadata as homeMetadata } from "../src/app/(english)/en/page";
import EnglishJoinPage, { metadata as joinMetadata } from "../src/app/(english)/en/join/page";
import EnglishLayout from "../src/app/(english)/layout";

const rules = {
  builder: { merged_prs: 12, external_prs: 6, commits: 60, new_repos: 2 },
  creative: { merged_prs: 9, external_prs: 4, new_works: 3 },
};

beforeEach(() => {
  configured = true;
  settings = { contribution_rules: rules, positions: { builder: ["Web", "Game"], creative: ["Video"] } };
});

describe("English landing", () => {
  it("leads with the purpose and points to the English join page", async () => {
    render(await EnglishHomePage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Learn, build, contribute");
    const join = screen.getAllByRole("link", { name: /Join with GitHub/i })[0];
    expect(join.getAttribute("href")).toBe("/en/join");
    expect(screen.getByRole("link", { name: /See the members/i }).getAttribute("href")).toBe("/members");
  });

  it("shows the real monthly targets from the settings", async () => {
    render(await EnglishHomePage());
    const text = document.body.textContent ?? "";
    expect(text).toContain("12 merged pull requests");
    expect(text).toContain("6 of them in repos owned by someone else");
    expect(text).toContain("60 commits");
    expect(text).toContain("3 new works");
  });

  it("falls back to the default targets when the settings cannot be read", async () => {
    configured = false;
    render(await EnglishHomePage());
    expect(document.body.textContent).toContain("10 merged pull requests");
  });

  it("lists the positions from the settings and the real Muara Arus 1 links", async () => {
    render(await EnglishHomePage());
    expect(screen.getByText("Web")).toBeTruthy();
    expect(screen.getByText("Video")).toBeTruthy();
    expect(screen.getByRole("link", { name: /Hugging Face/ }).getAttribute("href")).toBe("https://huggingface.co/MuaraAI/muara-arus-1");
    expect(screen.getByRole("link", { name: /All repositories/i }).getAttribute("href")).toBe("https://github.com/MuaraAI");
  });

  it("is written in English with no em dashes, fake numbers or enforcement claims", async () => {
    render(await EnglishHomePage());
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/\bDaftar\b|\bKomunitas\b|\bBelajar\b|\bMasuk\b/);
    expect(text).not.toContain("—");
    expect(text).not.toMatch(/\d+\+ (members|users)|testimonial/i);
    expect(text).not.toMatch(/removed|kicked|terminated/i);
  });

  it("is searchable in both languages", () => {
    expect(String(homeMetadata.title)).toContain("MuaraAI");
    expect(homeMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/", en: "https://muaraai.com/en" });
  });
});

describe("English join page", () => {
  it("explains the steps and starts GitHub sign-in", async () => {
    render(await EnglishJoinPage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Join MuaraAI");
    expect(screen.getByRole("link", { name: /Continue with GitHub/i }).getAttribute("href")).toBe("/api/auth/login");
    expect(screen.getByRole("link", { name: /Code of Conduct/i }).getAttribute("href")).toBe("/code-of-conduct");
  });

  it("keeps the breadcrumb in English and inside the English site", async () => {
    render(await EnglishJoinPage());
    expect(screen.getByRole("link", { name: /Home/ }).getAttribute("href")).toBe("/en");
    expect(screen.queryByText(/Beranda/)).toBeNull();
  });

  it("says plainly that the form and the rules are still Indonesian", async () => {
    render(await EnglishJoinPage());
    expect(document.body.textContent).toMatch(/registration form is only available in Indonesian/i);
    expect(document.body.textContent).toMatch(/Code of Conduct.*Indonesian/i);
  });

  it("has English metadata that links back to the Indonesian page", () => {
    expect(String(joinMetadata.title)).toContain("Join");
    expect(joinMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/join" });
  });
});

describe("English layout", () => {
  it("wraps the pages in an English document region with English navigation", async () => {
    const { container } = render(await EnglishLayout({ children: <p>content</p> }));
    const region = container.querySelector('[lang="en"]') as HTMLElement;
    expect(region).toBeTruthy();
    expect(within(region).getByRole("link", { name: "Projects" })).toBeTruthy();
    expect(within(region).getByText("Back to top")).toBeTruthy();
    expect(within(region).getByText("content")).toBeTruthy();
  });
});
