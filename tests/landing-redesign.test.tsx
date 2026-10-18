import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Hero from "../src/components/landing/hero";
import MetricsBar from "../src/components/landing/metrics-bar";

describe("MuaraAI public redesign", () => {
  it("leads with the UBSI student community purpose", () => {
    render(<Hero />);
    expect(screen.getByText(/kampus di seluruh Indonesia/i)).toBeTruthy();
    expect(screen.getByText(/Daftar dengan GitHub/i)).toBeTruthy();
    expect(screen.queryByText(/API 99\.9% Uptime/i)).toBeNull();
    expect(screen.queryByText(/AES-256-GCM Vault Active/i)).toBeNull();
    expect(screen.queryByText(/Latency/i)).toBeNull();
  });

  it("does not render unsupported engineering metrics as the public story", () => {
    render(<MetricsBar />);
    expect(screen.queryByText(/Automated Tests/i)).toBeNull();
    expect(screen.queryByText(/AI-Slop Tolerance/i)).toBeNull();
    expect(screen.queryByText(/Open Source/i)).toBeNull();
  });
});
