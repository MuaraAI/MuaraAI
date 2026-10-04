import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Navbar from "../src/components/landing/navbar";

describe("Navbar v2 Floating Pill", () => {
  it("renders floating pill navbar with brand, links, and v2-alpha badge", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Muara AI")).toBeDefined();
    expect(screen.getByText("Anggota")).toBeDefined();
    expect(screen.getByText("Maintainers")).toBeDefined();
    expect(screen.getByText("v2-alpha")).toBeDefined();
  });
});
