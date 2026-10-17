import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";

describe("Hero v3 editorial community introduction", () => {
  it("renders the student-community purpose and real entry points", () => {
    render(<Hero />);
    expect(screen.getByText("Daftar dengan GitHub")).toBeDefined();
    expect(screen.getByText("Lihat anggota")).toBeDefined();
    expect(screen.queryByText(/15.5:1 Text Contrast/i)).toBeNull();
    expect(screen.queryByText(/Zero Font CDN/i)).toBeNull();
    expect(screen.queryByText(/API 99\.9% Uptime/i)).toBeNull();
  });
});
