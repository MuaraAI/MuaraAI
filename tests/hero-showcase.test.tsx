import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";
import HeroShowcase, { buildHeroStats } from "../src/components/landing/hero-showcase";

describe("hero product showcase", () => {
  it("shows both products with a screenshot, their real sites and repos, and the Mira independence note", () => {
    render(<HeroShowcase />);

    expect(screen.getByRole("img", { name: "Tampilan depan situs Mira" }).getAttribute("src")).toContain("mira.jpg");
    expect(screen.getByRole("img", { name: "Tampilan depan situs FluxCode" }).getAttribute("src")).toContain("fluxcode.jpg");
    expect(screen.getAllByRole("link", { name: /Buka web/i }).map((link) => link.getAttribute("href"))).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    expect(screen.getAllByRole("link", { name: /Repositori GitHub/i }).map((link) => link.getAttribute("href"))).toEqual(["https://github.com/MuaraAI/Mira", "https://github.com/MuaraAI/FluxCode"]);
    expect(screen.getByText(/tidak berafiliasi dengan UBSI/i)).toBeTruthy();
  });

  it("marks the AI portal as coming soon without a link, and points to the project page", () => {
    render(<HeroShowcase />);
    expect(screen.getByText(/Segera hadir/)).toBeTruthy();
    expect(screen.getByText(/Muara V1 Flash/)).toBeTruthy();
    expect(screen.queryByRole("link", { name: /Muara V1 Flash/ })).toBeNull();
    expect(screen.getByRole("link", { name: /Lihat semua project/ }).getAttribute("href")).toBe("/projects");
  });

  it("reads in English, with English alt text and links", () => {
    const { container } = render(<HeroShowcase locale="en" />);
    expect(screen.getByRole("img", { name: "Front page of the Mira site" })).toBeTruthy();
    expect(screen.getAllByRole("link", { name: /Open site/ })).toHaveLength(2);
    // The project page is Indonesian-only, so English visitors are sent to the org on GitHub.
    expect(screen.getByRole("link", { name: /See all projects/ }).getAttribute("href")).toBe("https://github.com/MuaraAI");
    expect(container.textContent).not.toMatch(/\b(Buka|Tampilan|Segera|yang|dan)\b/);
  });

  it("shows a one-line summary of real numbers, and leaves out whatever is not known", () => {
    const { unmount } = render(<HeroShowcase stats={{ maintainers: 3, members: 4, stars: 123 }} />);
    expect(screen.getByText("3 maintainer · 4 anggota · FluxCode 123 bintang")).toBeTruthy();
    unmount();

    const second = render(<HeroShowcase stats={{ maintainers: 3, members: 4 }} />);
    expect(screen.getByText("3 maintainer · 4 anggota")).toBeTruthy();
    second.unmount();

    render(<HeroShowcase />);
    expect(screen.queryByText(/maintainer ·/)).toBeNull();
  });

  it("uses singular and plural in English", () => {
    const { unmount } = render(<HeroShowcase locale="en" stats={{ maintainers: 1, members: 1, stars: 1 }} />);
    expect(screen.getByText("1 maintainer · 1 member · FluxCode 1 star")).toBeTruthy();
    unmount();
    render(<HeroShowcase locale="en" stats={{ maintainers: 3, members: 4, stars: 123 }} />);
    expect(screen.getByText("3 maintainers · 4 members · FluxCode 123 stars")).toBeTruthy();
  });
});

describe("buildHeroStats", () => {
  const people = [
    { hierarchy: "maintainer", roles: ["maintainer"] },
    { hierarchy: "member", roles: ["maintainer"] },
    { hierarchy: "member", roles: [] },
  ];
  const repo = (name: string, stars: number) => ({ name, description: "", url: "", language: "", stars, pushedAt: "" });

  it("counts people from the members table, using the same maintainer rule as the database", () => {
    expect(buildHeroStats(people, { ok: true, repos: [repo("FluxCode", 123)] })).toEqual({ maintainers: 2, members: 3, stars: 123 });
  });

  it("leaves the stars out when GitHub could not be reached or the repo is missing", () => {
    expect(buildHeroStats(people, { ok: false, repos: [] })).toEqual({ maintainers: 2, members: 3 });
    expect(buildHeroStats(people, { ok: true, repos: [repo("Mira", 9)] })).toEqual({ maintainers: 2, members: 3 });
  });
});

describe("hero", () => {
  it("keeps the headline and sign-up path, and now carries the showcase on the right", () => {
    render(<Hero stats={{ maintainers: 3, members: 4 }} />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Belajar, membangun, berkontribusi.");
    expect(screen.getByText("Daftar dengan GitHub")).toBeTruthy();
    expect(screen.getByRole("img", { name: "Tampilan depan situs FluxCode" })).toBeTruthy();
    expect(screen.getByText("3 maintainer · 4 anggota")).toBeTruthy();
  });
});
