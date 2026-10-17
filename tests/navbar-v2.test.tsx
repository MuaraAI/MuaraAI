import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Navbar from "../src/components/landing/navbar";

describe("Public navigation shell", () => {
  it("renders the MuaraAI v3 public destinations", () => {
    render(<Navbar user={null} />);
    expect(screen.getByText("Muara AI")).toBeDefined();
    expect(screen.getAllByText("Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Anggota").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cara Gabung").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Masuk").length).toBeGreaterThan(0);
    expect(screen.queryByText("Maintainers")).toBeNull();
    expect(screen.queryByText("v2-alpha")).toBeNull();
  });
});
