import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

vi.mock("@/app/actions/pow", () => ({ submitProofOfWork: vi.fn() }));

import PoWForm from "../src/components/auth/pow-modal";
import { validatePoWSubmission, type PoWInput } from "../src/lib/validation";

const withSecurity = { builder: ["Web"], creative: ["Video"], cybersecurity: ["Pentester", "CTF"] };
const withoutSecurity = { builder: ["Web"], creative: ["Video"] };
const valid: PoWInput = {
  fullName: "Budi Santoso",
  affiliation: "umum",
  institution: "",
  phoneWa: "081234567890",
  telegramUsername: "",
  division: "cybersecurity",
  track: "Pentester",
  joinReason: "x".repeat(50),
  portfolioUrl: "https://github.com/budi/repo",
  toolchainNarrative: "Burp Suite, Nmap dan Python.",
};

describe("sign-up validation with the Cybersecurity division", () => {
  it("accepts it as the main or the second division, with one of its own positions", () => {
    expect(validatePoWSubmission(valid, withSecurity).isValid).toBe(true);
    const second = { ...valid, division: "builder" as const, track: "Web", secondaryDivision: "cybersecurity" as const, secondaryTrack: "CTF" };
    expect(validatePoWSubmission(second, withSecurity).isValid).toBe(true);
  });

  it("rejects a position from another division, and the division before it has any position", () => {
    expect(validatePoWSubmission({ ...valid, track: "Web" }, withSecurity).isValid).toBe(false);
    expect(validatePoWSubmission(valid, withoutSecurity).isValid).toBe(false);
    expect(validatePoWSubmission({ ...valid, division: "marketing" as never }, withSecurity).isValid).toBe(false);
  });
});

describe("sign-up form with the Cybersecurity division", () => {
  const storage = new Map<string, string>();
  beforeEach(() => {
    storage.clear();
    vi.stubGlobal("localStorage", { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => void storage.set(key, value), removeItem: (key: string) => void storage.delete(key) });
  });
  afterEach(() => vi.unstubAllGlobals());

  const divisionOptions = () => {
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
    fireEvent.click(screen.getByRole("button", { name: /^Next$/ }));
    return screen.getAllByRole("option").map((option) => option.textContent);
  };

  it("offers Cybersecurity once it has positions", () => {
    render(<PoWForm positions={withSecurity} locale="en" />);
    expect(divisionOptions()).toEqual(expect.arrayContaining(["Builder", "Creative", "Cybersecurity"]));
  });

  it("does not offer a division that has no positions yet", () => {
    render(<PoWForm positions={withoutSecurity} locale="en" />);
    expect(divisionOptions()).not.toContain("Cybersecurity");
  });

  it("starts on the first division that has positions when Builder has none", () => {
    render(<PoWForm positions={{ builder: [], creative: ["Video"], cybersecurity: ["Pentester"] }} locale="en" />);
    const options = divisionOptions();
    expect(options).not.toContain("Builder");
    expect(options).toEqual(expect.arrayContaining(["Creative", "Cybersecurity"]));
    expect(screen.queryByText("Choose…")).toBeNull();
  });
});
