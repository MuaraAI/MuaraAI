import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import NationalCampusMap from "../src/components/landing/national-campus-map";

describe("national campus map", () => {
  it("renders the founding hub, regional hub, and accessible network description", () => {
    render(<NationalCampusMap />);
    expect(screen.getByRole("img", { name: /Peta jaringan universitas Indonesia/i })).toBeTruthy();
    expect(screen.getByText("UBSI Pontianak")).toBeTruthy();
    expect(screen.getAllByText("UNTAN").length).toBeGreaterThan(0);
    expect(screen.getAllByText("ITB").length).toBeGreaterThan(0);
    expect(screen.getAllByText("UI").length).toBeGreaterThan(0);
    expect(screen.getAllByText("UGM").length).toBeGreaterThan(0);
    expect(screen.getAllByText("UNHAS").length).toBeGreaterThan(0);
    expect(screen.queryByText("UBSI Jakarta")).toBeNull();
    expect(screen.getByRole("list", { name: /universitas jaringan nasional/i })).toBeTruthy();
    expect(screen.getByText(/Founding hub/i)).toBeTruthy();
  });

  it("renders routes toward Pontianak", () => {
    const { container } = render(<NationalCampusMap />);
    expect(container.querySelectorAll("path[data-route]").length).toBeGreaterThan(0);
  });
});
