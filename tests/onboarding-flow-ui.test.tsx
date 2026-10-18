import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import PoWForm from "../src/components/auth/pow-modal";

describe("guided national onboarding", () => {
  it("shows identity, proof of work, profile, and review steps", () => {
    render(<PoWForm />);

    expect(screen.getAllByText(/Identitas kampus/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Proof of Work/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Profil publik/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Review/i).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Lanjut/i })).toBeTruthy();
  });

  it("collects a campus-agnostic identity: free-text prodi and optional kelas", () => {
    render(<PoWForm />);

    const nim = screen.getByLabelText(/NIM mahasiswa/i) as HTMLInputElement;
    expect(nim.maxLength).toBe(16);
    fireEvent.change(nim, { target: { value: "1023109876" } });
    expect(nim.value).toBe("1023109876");

    const prodi = screen.getByLabelText(/Program Studi/i) as HTMLInputElement;
    expect(prodi.tagName).toBe("INPUT");
    fireEvent.change(prodi, { target: { value: "Ilmu Komputer" } });
    expect(prodi.value).toBe("Ilmu Komputer");

    const kelas = screen.getByLabelText(/Kode Kelas/i) as HTMLInputElement;
    expect(kelas.required).toBe(false);
    expect(kelas.value).toBe("");
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
