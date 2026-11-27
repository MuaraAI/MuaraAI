import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ProjectsPage from "../src/app/(public)/projects/page";

describe("Projects page", () => {
  it("shows only the community's products, with live sites, and points to the Karya page for the rest", () => {
    render(<ProjectsPage />);

    const sites = screen.getAllByRole("link", { name: /Buka web/i }).map((link) => link.getAttribute("href"));
    expect(sites).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    expect(screen.getByText(/Segera hadir/)).toBeTruthy();
    expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
    expect(screen.queryByText("Repo lainnya")).toBeNull();
    expect(screen.getByRole("link", { name: /Lihat karya lainnya/ }).getAttribute("href")).toBe("/karya");
    expect(screen.getByRole("link", { name: /Buka di GitHub/ }).getAttribute("href")).toBe("https://github.com/MuaraAI");
  });
});
