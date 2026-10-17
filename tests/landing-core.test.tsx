import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ProjectsGrid from "../src/components/landing/projects-grid";
import MetricsBar from "../src/components/landing/metrics-bar";
import Manifesto from "../src/components/landing/manifesto";
import BenefitsGrid from "../src/components/landing/benefits-grid";

describe("Landing Core Sections", () => {
  it("displays strictly the 2 live flagship projects", () => {
    render(<ProjectsGrid />);
    expect(screen.getByText(/ubsi api/i)).toBeDefined();
    expect(screen.getByText(/muara ai gateway/i)).toBeDefined();
    expect(screen.queryByText(/ai bot ciel/i)).toBeNull();
  });

  it("displays the Learn Build Contribute current", () => {
    render(<MetricsBar />);
    expect(screen.getByText("Belajar")).toBeDefined();
    expect(screen.getByText("Membangun")).toBeDefined();
    expect(screen.getByText("Berkontribusi")).toBeDefined();
    expect(screen.queryByText(/126\+/)).toBeNull();
  });

  it("renders manifesto comparing pasaran vs muara ai", () => {
    render(<Manifesto />);
    expect(screen.getByText(/pengguna pasaran/i)).toBeDefined();
    expect(screen.getByText(/praktisi muara ai/i)).toBeDefined();
  });

  it("renders member benefits", () => {
    render(<BenefitsGrid />);
    expect(screen.getByText(/muara learn/i)).toBeDefined();
  });
});
