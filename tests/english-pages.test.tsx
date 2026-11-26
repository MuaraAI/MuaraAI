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

  it("lists the positions from the settings and the two featured products", async () => {
    render(await EnglishHomePage());
    expect(screen.getByText("Web")).toBeTruthy();
    expect(screen.getByText("Video")).toBeTruthy();
    for (const name of ["Mira", "FluxCode"]) expect(screen.getByRole("heading", { name })).toBeTruthy();
    expect(document.body.textContent).toContain("Coming soon");
    expect(screen.queryByRole("link", { name: /Muara V1 Flash/ })).toBeNull();
    const sites = screen.getAllByRole("link", { name: /Open site/i }).map((link) => link.getAttribute("href"));
    expect(sites).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    expect(document.body.textContent).toMatch(/native code editor written in Rust/i);
    expect(document.body.textContent).not.toMatch(/Muara Arus|Hugging Face|Ollama/);
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

  it("shares as an English page, not as the Indonesian root", () => {
    expect(homeMetadata.openGraph).toMatchObject({ url: "https://muaraai.com/en", locale: "en_US", siteName: "MuaraAI" });
    expect(String(homeMetadata.openGraph?.title)).toContain("open community");
    expect(String(homeMetadata.twitter?.title)).toContain("open community");
    expect(joinMetadata.openGraph).toMatchObject({ url: "https://muaraai.com/en/join", locale: "en_US" });
    expect(String(joinMetadata.twitter?.title)).toContain("Join");
  });

  it("states the tier and review rules the way the system applies them", async () => {
    render(await EnglishHomePage());
    const text = document.body.textContent ?? "";
    expect(text).toContain("Members who meet the target earn a recognition tier");
    expect(text).toContain("approved by someone other than the author");
    expect(text).not.toContain("another member approved");
  });

  it("is searchable in both languages", () => {
    expect(String(homeMetadata.title)).toContain("MuaraAI");
    expect(homeMetadata.alternates?.languages).toMatchObject({ id: "https://muaraai.com/", en: "https://muaraai.com/en", "x-default": "https://muaraai.com/" });
  });
});

describe("English join page", () => {
  it("explains the steps and starts GitHub sign-in", async () => {
    render(await EnglishJoinPage());
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain("Join MuaraAI");
    expect(screen.getByRole("link", { name: /Continue with GitHub/i }).getAttribute("href")).toBe("/api/auth/login?next=/en/onboarding");
    expect(screen.getByRole("link", { name: /Code of Conduct/i }).getAttribute("href")).toBe("/en/code-of-conduct");
  });

  it("keeps the breadcrumb in English and inside the English site", async () => {
    render(await EnglishJoinPage());
    expect(screen.getByRole("link", { name: /Home/ }).getAttribute("href")).toBe("/en");
    expect(screen.queryByText(/Beranda/)).toBeNull();
  });

  it("tells the truth about languages: the form is in English, the legal documents are not", async () => {
    render(await EnglishJoinPage());
    const text = document.body.textContent ?? "";
    expect(text).not.toMatch(/registration form is only available in Indonesian/i);
    expect(text).toMatch(/English translations of the Indonesian originals/i);
    expect(text).not.toMatch(/only available in Indonesian/i);
  });

  it("has English metadata that links back to the Indonesian page", () => {
    expect(String(joinMetadata.title)).toContain("Join");
    // The Indonesian counterpart of /en/join is not a single page, so no hreflang pair is claimed (it would not be reciprocal).
    expect(joinMetadata.alternates?.canonical).toBe("https://muaraai.com/en/join");
    expect(joinMetadata.alternates).not.toHaveProperty("languages");
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
