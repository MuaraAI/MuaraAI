import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AccoladesGrid from "../src/components/landing/accolades-grid";
import type { Achievement } from "../src/types/database";

const achievement = { id: "a1", title: "Juara 1 Hackathon", issuer: "SIFEST", issue_date: "2026-10-01", image_url: null, verify_url: null, description: "" } as unknown as Achievement;

describe("achievements on the landing page", () => {
  it("shows no section at all while there are none, instead of an empty placeholder", () => {
    const { container } = render(<AccoladesGrid initialAchievements={[]} />);
    expect(container.textContent).toBe("");
    expect(screen.queryByText(/segera hadir/i)).toBeNull();
  });

  it("shows the section once there is something to show", () => {
    render(<AccoladesGrid initialAchievements={[achievement]} />);
    expect(screen.getByText("Prestasi & rekognisi anggota")).toBeTruthy();
    expect(screen.getByText("Juara 1 Hackathon")).toBeTruthy();
  });
});
