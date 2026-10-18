import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import NationalCampusMap from "../src/components/landing/national-campus-map";

describe("national campus map", () => {
  it("renders the founding hub, regional hub, and accessible network description", () => {
    render(<NationalCampusMap />);
    expect(screen.getByRole("img", { name: /kampus UBSI seluruh Indonesia/i })).toBeTruthy();
    expect(screen.getByText("UBSI Pontianak")).toBeTruthy();
    expect(screen.getByText("UBSI Jakarta")).toBeTruthy();
    expect(screen.getByText(/Founding hub/i)).toBeTruthy();
  });

  it("renders routes toward Pontianak", () => {
    const { container } = render(<NationalCampusMap />);
    expect(container.querySelectorAll("path[data-route]").length).toBeGreaterThan(0);
  });
});
