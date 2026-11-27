import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

const fetchMock = vi.fn();
vi.mock("@/lib/github-repos", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../src/lib/github-repos")>()),
  fetchOrgRepos: (...args: unknown[]) => fetchMock(...args),
}));

import KaryaPage from "../src/app/(public)/karya/page";

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

describe("Karya page", () => {
  it("lists the community's other work from the org, without the products, the org profile or unreleased repos", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      repos: [repo("Mira"), repo("FluxCode"), repo("chess-agent"), repo(".github"), repo("ai-web"), repo("site", { description: "", language: "", stars: 0 })],
    });
    render(await KaryaPage());

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Karya");
    const chess = screen.getByRole("link", { name: /chess-agent/ });
    expect(chess.getAttribute("href")).toBe("https://github.com/MuaraAI/chess-agent");
    expect(chess.getAttribute("rel")).toContain("noopener");
    for (const hidden of [/^Mira$/, /^FluxCode$/, /^\.github$/, /ai-web/]) expect(screen.queryByRole("link", { name: hidden })).toBeNull();
    expect(screen.getByText("Belum ada deskripsi.")).toBeTruthy();
    expect(screen.getByText("3 bintang")).toBeTruthy();
  });

  it("sends people to the Project page for the main products and tells them how to add their own work", async () => {
    fetchMock.mockResolvedValue({ ok: true, repos: [repo("chess-agent")] });
    render(await KaryaPage());

    expect(screen.getByRole("link", { name: /Lihat project utama/ }).getAttribute("href")).toBe("/projects");
    expect(screen.getByText(/buka pull request/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Buka di GitHub/ }).getAttribute("href")).toBe("https://github.com/MuaraAI");
  });

  it("says so when there is no other work yet", async () => {
    fetchMock.mockResolvedValue({ ok: true, repos: [repo("Mira")] });
    render(await KaryaPage());
    expect(screen.getByText("Belum ada karya lain.")).toBeTruthy();
  });

  it("explains the failure and still points to GitHub when the list cannot be loaded", async () => {
    fetchMock.mockResolvedValue({ ok: false, repos: [] });
    render(await KaryaPage());
    expect(screen.getByRole("alert").textContent).toContain("belum bisa dimuat");
    expect(screen.getByRole("link", { name: /Buka di GitHub/ })).toBeTruthy();
  });
});
