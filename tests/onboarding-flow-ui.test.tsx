import { describe, expect, it } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import PoWForm from "../src/components/auth/pow-modal";

const positions = { builder: ["Web", "Backend"], creative: ["Video", "Copywriting"] };
const renderForm = () => render(<PoWForm positions={positions} />);
const next = () => fireEvent.click(screen.getByRole("button", { name: /^Lanjut$/i }));
const nextButton = () => screen.getByRole("button", { name: /^Lanjut$/i }) as HTMLButtonElement;
const listFor = (id: string) => within(document.getElementById(`${id}-list`) as HTMLElement);
const choose = (id: string, label: string) => fireEvent.click(listFor(id).getByRole("option", { name: label }));

function fillStepOne() {
  fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "Budi Santoso" } });
  fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
}

function fillStepTwo(reason = "x".repeat(50)) {
  fireEvent.change(screen.getByLabelText(/Tautan Repositori/i), { target: { value: "https://github.com/budi/repo" } });
  fireEvent.change(screen.getByLabelText(/Toolchain/i), { target: { value: "Next.js dan Supabase dengan Cursor" } });
  fireEvent.change(screen.getByLabelText(/Alasan bergabung/i), { target: { value: reason } });
}

describe("open global onboarding", () => {
  it("shows about-you, proof of work, profile, and review steps", () => {
    renderForm();
    expect(screen.getAllByText(/Tentang kamu/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Proof of Work/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Profil publik/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Review/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/2026\+/)).toBeNull();
  });

  it("asks for status, optional institution, required WhatsApp, optional Telegram, and no student ids", () => {
    renderForm();
    expect(screen.getByLabelText(/Status/i)).toBeTruthy();
    expect((screen.getByLabelText(/Institusi/i) as HTMLInputElement).required).toBe(false);
    expect((screen.getByLabelText(/WhatsApp/i) as HTMLInputElement).required).toBe(true);
    expect((screen.getByLabelText(/Telegram/i) as HTMLInputElement).required).toBe(false);
    for (const legacy of [/NIM/i, /Program Studi/i, /Kode Kelas/i, /Kampus/i]) {
      expect(screen.queryByLabelText(legacy)).toBeNull();
    }
    for (const label of ["Mahasiswa", "Pelajar", "Umum", "Lainnya"]) {
      expect(listFor("affiliation").getByRole("option", { name: label })).toBeTruthy();
    }
  });

  it("keeps Lanjut disabled on step one until name and WhatsApp are filled", () => {
    renderForm();
    expect(nextButton().disabled).toBe(true);
    fillStepOne();
    expect(nextButton().disabled).toBe(false);
  });

  it("offers positions from the configured list and follows the chosen division", () => {
    renderForm();
    fillStepOne();
    next();
    expect(screen.getByLabelText(/^Posisi \*/i).textContent).toContain("Web");
    expect(listFor("track").getByRole("option", { name: "Backend" })).toBeTruthy();
    expect(listFor("track").queryByRole("option", { name: "Video" })).toBeNull();

    choose("division", "Creative");
    expect(screen.getByLabelText(/^Posisi \*/i).textContent).toContain("Video");
    expect(listFor("track").getByRole("option", { name: "Copywriting" })).toBeTruthy();
    expect(listFor("track").queryByRole("option", { name: "Web" })).toBeNull();
  });

  it("offers an optional secondary division that excludes the primary one", () => {
    renderForm();
    fillStepOne();
    next();
    expect(listFor("secondaryDivision").getByRole("option", { name: "Tidak ada" })).toBeTruthy();
    expect(listFor("secondaryDivision").getByRole("option", { name: "Creative" })).toBeTruthy();
    expect(listFor("secondaryDivision").queryByRole("option", { name: "Builder" })).toBeNull();
    expect(document.getElementById("secondaryTrack-list")).toBeNull();

    choose("secondaryDivision", "Creative");
    expect(listFor("secondaryTrack").getByRole("option", { name: "Video" })).toBeTruthy();
  });

  it("requires a 50-character join reason (after trimming) before leaving the Proof of Work step", () => {
    renderForm();
    fillStepOne();
    next();
    fillStepTwo(`  ${"x".repeat(49)}  `);
    expect(screen.getByText("49/50")).toBeTruthy();
    expect(nextButton().disabled).toBe(true);

    fireEvent.change(screen.getByLabelText(/Alasan bergabung/i), { target: { value: "x".repeat(50) } });
    expect(screen.getByText("50/50")).toBeTruthy();
    expect(nextButton().disabled).toBe(false);
  });

  it("requires legal agreement before submitting and shows status and position in the review", () => {
    renderForm();
    fillStepOne();
    next();
    fillStepTwo();
    next();
    next();
    expect(screen.getByText("Web", { exact: false })).toBeTruthy();
    const githubButton = screen.getByRole("button", { name: /Kirim Pendaftaran/i }) as HTMLButtonElement;
    expect(githubButton.disabled).toBe(true);
    expect(screen.getByRole("link", { name: /Privacy Policy/i })).toBeTruthy();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(githubButton.disabled).toBe(false);
  });

  it("moves forward and back without losing the draft", () => {
    renderForm();
    fillStepOne();
    next();
    expect(screen.getAllByText(/Proof of Work/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /Kembali/i }));
    expect((screen.getByLabelText(/Nama Lengkap/i) as HTMLInputElement).value).toBe("Budi Santoso");
  });
});
