import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const fetchMock = vi.fn();
vi.mock("@/lib/github-repos", () => ({ fetchOrgRepos: (...args: unknown[]) => fetchMock(...args) }));

import ProjectsPage from "../src/app/(public)/projects/page";

const repo = (name: string, over: Record<string, unknown> = {}) => ({
  name,
  description: `Deskripsi ${name}`,
  url: `https://github.com/MuaraAI/${name}`,
  language: "TypeScript",
  stars: 3,
  pushedAt: "2026-11-20T10:00:00Z",
  ...over,
});

beforeEach(() => fetchMock.mockReset());

describe("Projects page", () => {
  it("shows the org's products first, with live sites, and does not repeat them in the repo list", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      repos: [repo("Mira"), repo("chess-agent"), repo(".github"), repo("site", { description: "", language: "" })],
    });
    render(await ProjectsPage());

    const sites = screen.getAllByRole("link", { name: /Buka web/i }).map((link) => link.getAttribute("href"));
    expect(sites).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    expect(screen.getByText(/Segera hadir/)).toBeTruthy();

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs.filter((href) => href === "https://github.com/MuaraAI/Mira")).toHaveLength(1);
    const other = screen.getByRole("link", { name: /chess-agent/ });
    expect(other.getAttribute("href")).toBe("https://github.com/MuaraAI/chess-agent");
    expect(other.getAttribute("rel")).toContain("noopener");
    expect(screen.queryByRole("link", { name: /^\.github$/ })).toBeNull();
    expect(screen.getByText("Belum ada deskripsi.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("keeps the products visible when there are no other public repos", async () => {
    fetchMock.mockResolvedValue({ ok: true, repos: [] });
    render(await ProjectsPage());
    expect(screen.getByRole("heading", { name: "FluxCode" })).toBeTruthy();
    expect(screen.getByText("Belum ada repo lain.")).toBeTruthy();
  });

  it("explains the failure and still points to GitHub when the list cannot be loaded", async () => {
    fetchMock.mockResolvedValue({ ok: false, repos: [] });
    render(await ProjectsPage());

    expect(screen.getByRole("heading", { name: "Mira" })).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("belum bisa dimuat");
    expect(screen.getByRole("link", { name: /Buka di GitHub/ }).getAttribute("href")).toBe("https://github.com/MuaraAI");
  });
});
