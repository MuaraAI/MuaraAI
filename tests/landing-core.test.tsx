import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";
import Manifesto from "../src/components/landing/manifesto";
import BenefitsGrid from "../src/components/landing/benefits-grid";

describe("Landing Core Sections", () => {
  it("features Mira and FluxCode with their real sites and marks the AI portal as coming soon", () => {
    render(<Hero />);
    for (const name of ["Mira", "FluxCode"]) expect(screen.getByRole("heading", { name })).toBeDefined();
    const sites = screen.getAllByRole("link", { name: /Buka web/i }).map((link) => link.getAttribute("href"));
    expect(sites).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    expect(screen.getByText(/Segera hadir/)).toBeDefined();
    expect(screen.getByText(/Muara V1 Flash/)).toBeDefined();
    expect(screen.queryByRole("link", { name: /Muara V1 Flash/ })).toBeNull();
    expect(screen.queryByRole("heading", { name: "Laku" })).toBeNull();
    expect(screen.queryByText(/Muara Arus/i)).toBeNull();
  });

  it("renders the community principles", () => {
    render(<Manifesto />);
    expect(screen.getByText(/Belajar dari sumber yang jelas/i)).toBeDefined();
    expect(screen.getByText(/Terbuka untuk semua/i)).toBeDefined();
    expect(screen.getByText(/Menjadi muara komunitas praktisi/i)).toBeDefined();
    expect(screen.getByText(/tanpa AI-slop, dengan tes, dan tanpa kredensial di repo/i)).toBeDefined();
  });

  it("renders member benefits", () => {
    render(<BenefitsGrid />);
    expect(screen.getByText(/muara learn/i)).toBeDefined();
  });
});
