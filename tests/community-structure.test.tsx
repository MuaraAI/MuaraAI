import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CommunityStructure from "../src/components/landing/community-structure";

const positions = { builder: ["Web", "Backend", "Game"], creative: ["Video", "Copywriting"] };

describe("CommunityStructure", () => {
  it("shows both divisions with their positions from the settings", () => {
    render(<CommunityStructure positions={positions} />);
    expect(screen.getByRole("heading", { name: "Builder" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Creative" })).toBeTruthy();
    for (const position of [...positions.builder, ...positions.creative]) expect(screen.getByText(position)).toBeTruthy();
  });

  it("lists the member roles and the four tiers", () => {
    render(<CommunityStructure positions={positions} />);
    for (const role of ["Maintainer", "Head", "Lead", "Member"]) expect(screen.getByText(role)).toBeTruthy();
    for (const tier of ["Riak", "Arus", "Pasang", "Samudra"]) expect(screen.getByText(tier)).toBeTruthy();
  });

  it("explains each rank in order, including the heads of both divisions", () => {
    render(<CommunityStructure positions={positions} />);
    const ranks = screen.getAllByRole("term").map((term) => term.textContent);
    expect(ranks).toEqual(["Maintainer", "Head", "Lead", "Member"]);
    expect(screen.getByText(/Head of Builder dan Head of Creative/)).toBeTruthy();
  });

  it("explains the ranks in English too", () => {
    render(<CommunityStructure positions={positions} locale="en" />);
    expect(screen.getByText(/Head of Builder and Head of Creative/)).toBeTruthy();
    expect(screen.queryByText(/Head of Builder dan/)).toBeNull();
  });

  it("still renders the divisions when the positions setting is missing", () => {
    render(<CommunityStructure positions={null} />);
    expect(screen.getByRole("heading", { name: "Builder" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Creative" })).toBeTruthy();
    expect(screen.queryByText("Web")).toBeNull();
  });

  it("anchors the section for in-page links and keeps tiers recognition-only", () => {
    const { container } = render(<CommunityStructure positions={positions} />);
    expect(container.querySelector("#struktur")).toBeTruthy();
    expect(screen.getByText(/tanpa hak istimewa/i)).toBeTruthy();
  });

  it("reads in English when asked, with the same data", () => {
    render(<CommunityStructure positions={positions} locale="en" />);
    expect(screen.getByRole("heading", { name: "Builder" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Creative" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Roles" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Tiers" })).toBeTruthy();
    expect(screen.getByText(/Recognition only/i)).toBeTruthy();
    expect(screen.queryByText(/tanpa hak istimewa/i)).toBeNull();
    expect(screen.queryByText(/Peran/)).toBeNull();
    for (const position of [...positions.builder, ...positions.creative]) expect(screen.getByText(position)).toBeTruthy();
  });
});
