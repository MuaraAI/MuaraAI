import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";

describe("MuaraAI public redesign", () => {
  it("reads its headline as one sentence, with spaces between the lines", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Belajar, membangun, berkontribusi.");
  });

  it("leads with the open community purpose", () => {
    render(<Hero />);
    expect(screen.getByText(/Komunitas terbuka untuk siapa saja/i)).toBeTruthy();
    expect(screen.getByText(/Mahasiswa, pelajar, atau umum/i)).toBeTruthy();
    expect(screen.getByText(/Daftar dengan GitHub/i)).toBeTruthy();
    expect(screen.queryByText(/API 99\.9% Uptime/i)).toBeNull();
    expect(screen.queryByText(/AES-256-GCM Vault Active/i)).toBeNull();
    expect(screen.queryByText(/Latency/i)).toBeNull();
  });

  it("does not render unsupported engineering metrics as the public story", () => {
    render(<Hero stats={{ maintainers: 3, members: 4 }} />);
    expect(screen.queryByText(/Automated Tests/i)).toBeNull();
    expect(screen.queryByText(/AI-Slop Tolerance/i)).toBeNull();
    expect(screen.queryByText(/Open Source/i)).toBeNull();
  });
});
