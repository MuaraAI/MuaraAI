import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import PoWForm from "../src/components/auth/pow-modal";

describe("guided UBSI onboarding", () => {
  it("shows identity, proof of work, profile, and review steps", () => {
    render(<PoWForm />);

    expect(screen.getAllByText(/Identitas UBSI/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Proof of Work/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Profil publik/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Review/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Lanjut/i })).toBeTruthy();
  });

  it("moves forward and back without losing the draft", () => {
    render(<PoWForm />);
    const name = screen.getByLabelText(/Nama Lengkap/i);
    fireEvent.change(name, { target: { value: "Yuken Velino" } });
    fireEvent.click(screen.getByRole("button", { name: /Lanjut/i }));

    expect(screen.getAllByText(/Proof of Work/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
    expect((screen.getByLabelText(/Nama Lengkap/i) as HTMLInputElement).value).toBe("Yuken Velino");
  });
});
