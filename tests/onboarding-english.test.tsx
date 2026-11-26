import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import React from "react";

const submitMock = vi.fn();
vi.mock("@/app/actions/pow", () => ({ submitProofOfWork: (...args: unknown[]) => submitMock(...args) }));

import PoWForm from "../src/components/auth/pow-modal";

const positions = { builder: ["Web", "Backend"], creative: ["Video"] };
const storage = new Map<string, string>();

beforeEach(() => {
  submitMock.mockReset();
  storage.clear();
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => storage.get(key) ?? null,
    setItem: (key: string, value: string) => void storage.set(key, value),
    removeItem: (key: string) => void storage.delete(key),
  });
  vi.stubGlobal("location", { href: "" });
});
afterEach(() => vi.unstubAllGlobals());

const next = (name: RegExp) => fireEvent.click(screen.getByRole("button", { name }));

function fillEnglish() {
  fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Budi Santoso" } });
  fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
  next(/^Next$/);
  fireEvent.change(screen.getByLabelText(/Link to a repository or portfolio/i), { target: { value: "https://github.com/budi/repo" } });
  fireEvent.change(screen.getByLabelText(/Tools and workflow/i), { target: { value: "Next.js and Supabase with Cursor" } });
  fireEvent.change(screen.getByLabelText(/Why you want to join/i), { target: { value: "x".repeat(50) } });
  next(/^Next$/);
  next(/^Next$/);
}

describe("registration form in English", () => {
  it("shows the steps, heading and fields in English, with no Indonesian left", () => {
    const { container } = render(<PoWForm positions={positions} locale="en" />);
    expect(screen.getByRole("heading", { name: "Create your community profile" })).toBeTruthy();
    expect(screen.getByRole("list", { name: "Registration progress" })).toBeTruthy();
    for (const step of ["About you", "Proof of Work", "Public profile", "Review"]) expect(screen.getAllByText(new RegExp(step)).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/Full name/i)).toBeTruthy();
    expect(screen.getByLabelText(/Institution \(optional\)/i)).toBeTruthy();
    expect(screen.getByLabelText(/Telegram \(optional\)/i)).toBeTruthy();
    expect(container.textContent).not.toMatch(/Tentang kamu|Lanjut|Nama Lengkap|Kembali|Pendaftaran|Institusi|Pilih/);
    // Placeholders and accessible names count too, not just visible text.
    const attributes = [...container.querySelectorAll("[placeholder],[aria-label]")].map((element) => `${element.getAttribute("placeholder") ?? ""} ${element.getAttribute("aria-label") ?? ""}`).join(" ");
    expect(attributes).not.toMatch(/Pilih|Kampus|Nomor aktif|Pendaftaran|Progress|Daftar/);
  });

  it("says Choose instead of Pilih on an empty select, and keeps Pilih in Indonesian", () => {
    const empty = { builder: [], creative: ["Video"] };
    render(<PoWForm positions={empty} locale="en" />);
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
    next(/^Next$/);
    expect(screen.getByText("Choose…")).toBeTruthy();
    expect(screen.queryByText("Pilih…")).toBeNull();
  });

  it("does not crash on an inherited key as the language, and falls back to Indonesian", () => {
    render(<PoWForm positions={positions} locale={"constructor" as never} />);
    expect(screen.getByRole("heading", { name: "Buat profil komunitasmu" })).toBeTruthy();
  });

  it("offers the status choices in English while keeping the stored values", () => {
    render(<PoWForm positions={positions} locale="en" />);
    const options = within(document.getElementById("affiliation-list") as HTMLElement).getAllByRole("option").map((option) => option.textContent);
    expect(options).toEqual(["Student", "Learner", "General", "Other"]);
  });

  it("keeps Next disabled until the name and WhatsApp number are filled", () => {
    render(<PoWForm positions={positions} locale="en" />);
    const button = screen.getByRole("button", { name: /^Next$/ }) as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
    expect(button.disabled).toBe(false);
  });

  it("walks to the review with English text, a legal gate and an honest note about the documents", () => {
    render(<PoWForm positions={positions} locale="en" />);
    fillEnglish();
    expect(screen.getByText("Review your application")).toBeTruthy();
    expect(screen.getByText("Position")).toBeTruthy();
    const submit = screen.getByRole("button", { name: "Continue to GitHub" }) as HTMLButtonElement;
    expect(submit.disabled).toBe(true);
    expect(screen.getByRole("link", { name: "Privacy Policy" }).getAttribute("href")).toBe("/privacy");
    expect(screen.getByRole("link", { name: "Code of Conduct" }).getAttribute("href")).toBe("/code-of-conduct");
    expect(document.body.textContent).toMatch(/only available in Indonesian/);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(submit.disabled).toBe(false);
  });

  it("explains in English when the legal box is not ticked, and sends visitors to GitHub with the English form as the return page", () => {
    render(<PoWForm positions={positions} locale="en" />);
    fillEnglish();
    fireEvent.submit(screen.getByRole("button", { name: "Continue to GitHub" }).closest("form") as HTMLFormElement);
    expect(screen.getByRole("alert").textContent).toBe("Accept the Privacy Policy, Terms of Service and Code of Conduct before continuing.");

    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Continue to GitHub" }));
    expect(window.location.href).toBe("/api/auth/login?next=/en/onboarding");
    expect(storage.get("muaraai_onboarding_draft")).toContain("Budi Santoso");
  });

  it("submits for a signed-in applicant with the language, and shows English errors", async () => {
    submitMock.mockResolvedValueOnce({ success: false });
    render(<PoWForm positions={positions} locale="en" authenticated githubUsername="budi" />);
    expect(screen.getByText(/GitHub account connected/)).toBeTruthy();
    fillEnglish();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));

    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(submitMock.mock.calls[0][1]).toBe("en");
    expect((await screen.findByRole("alert")).textContent).toBe("Could not submit your Proof of Work.");

    submitMock.mockResolvedValueOnce({ success: true });
    fireEvent.click(screen.getByRole("button", { name: "Submit application" }));
    await waitFor(() => expect(window.location.href).toBe("/dashboard"));
  });

  it("stays Indonesian by default, including the language it tells the server", async () => {
    submitMock.mockResolvedValue({ success: true });
    render(<PoWForm positions={positions} authenticated />);
    fireEvent.change(screen.getByLabelText(/Nama Lengkap/i), { target: { value: "Budi Santoso" } });
    fireEvent.change(screen.getByLabelText(/WhatsApp/i), { target: { value: "081234567890" } });
    next(/^Lanjut$/);
    fireEvent.change(screen.getByLabelText(/Tautan Repositori/i), { target: { value: "https://github.com/budi/repo" } });
    fireEvent.change(screen.getByLabelText(/Toolchain/i), { target: { value: "Next.js dan Supabase dengan Cursor" } });
    fireEvent.change(screen.getByLabelText(/Alasan bergabung/i), { target: { value: "x".repeat(50) } });
    next(/^Lanjut$/);
    next(/^Lanjut$/);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Kirim pendaftaran" }));
    await waitFor(() => expect(submitMock).toHaveBeenCalledTimes(1));
    expect(submitMock.mock.calls[0][1]).toBe("id");
  });
});
