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
  it("lists the org's repos as links to GitHub", async () => {
    fetchMock.mockResolvedValue({ ok: true, repos: [repo("muara-arus-1"), repo("site", { description: "", language: "" })] });
    render(await ProjectsPage());

    const link = screen.getByRole("link", { name: /muara-arus-1/ });
    expect(link.getAttribute("href")).toBe("https://github.com/MuaraAI/muara-arus-1");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText("Deskripsi muara-arus-1")).toBeTruthy();
    expect(screen.getByText("Belum ada deskripsi.")).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  });

  it("says so when the org has no public repos yet", async () => {
    fetchMock.mockResolvedValue({ ok: true, repos: [] });
    render(await ProjectsPage());
    expect(screen.getByText("Belum ada repo publik.")).toBeTruthy();
  });

  it("explains the failure and still points to GitHub when the list cannot be loaded", async () => {
    fetchMock.mockResolvedValue({ ok: false, repos: [] });
    render(await ProjectsPage());

    expect(screen.getByRole("alert").textContent).toContain("belum bisa dimuat");
    expect(screen.getByRole("link", { name: /Buka di GitHub/ }).getAttribute("href")).toBe("https://github.com/MuaraAI");
  });
});
