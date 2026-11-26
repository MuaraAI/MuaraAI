import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import PrivacyPage from "../src/app/(public)/privacy/page";
import TermsPage from "../src/app/(public)/terms/page";
import EnglishPrivacyPage from "../src/app/(english)/en/privacy/page";
import EnglishTermsPage from "../src/app/(english)/en/terms/page";

const text = () => document.body.textContent ?? "";

describe("Privacy Policy says what the product really does (Indonesian)", () => {
  it("no longer promises an AES-256 encryption the code does not do, and names the services that touch the data", () => {
    render(<PrivacyPage />);
    expect(text()).not.toMatch(/AES-256/i);
    for (const service of ["Supabase", "Vercel", "Resend", "Discord", "GitHub"]) expect(text()).toContain(service);
  });

  it("discloses the contribution data and the session attendance, and who can see what", () => {
    render(<PrivacyPage />);
    expect(text()).toMatch(/aktivitas GitHub/i);
    expect(text()).toMatch(/kehadiran sesi Discord/i);
    expect(text()).toMatch(/profil[^.]*publik/i);
    expect(text()).toMatch(/Hanya kamu dan maintainer/);
    expect(text()).toMatch(/cuplikan alasan bergabung/);
  });

  it("has the four sections", () => {
    render(<PrivacyPage />);
    for (const name of ["1. Data yang Dikumpulkan", "2. Siapa yang Dapat Melihat Datamu", "3. Penggunaan & Keamanan Data", "4. Hak Akses & Penghapusan"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
  });
});

describe("the English Privacy Policy says the same", () => {
  it("matches the Indonesian text", () => {
    render(<EnglishPrivacyPage />);
    expect(text()).not.toMatch(/AES-256/i);
    for (const service of ["Supabase", "Vercel", "Resend", "Discord", "GitHub"]) expect(text()).toContain(service);
    expect(text()).toMatch(/GitHub activity/i);
    expect(text()).toMatch(/Discord session attendance/i);
    expect(text()).toMatch(/profile of an approved member is public/i);
    expect(text()).toMatch(/Only you and the maintainers/);
    expect(text()).toMatch(/excerpt of your reason for joining/);
    for (const name of ["1. Data We Collect", "2. Who Can See Your Data", "3. Use & Security of Data", "4. Access & Deletion"]) {
      expect(screen.getByRole("heading", { level: 2, name })).toBeTruthy();
    }
  });
});

describe("Terms of Service do not promise compute", () => {
  it("lists only what donations pay for that the community stands behind", () => {
    const { unmount } = render(<TermsPage />);
    expect(text()).not.toMatch(/compute/i);
    expect(text()).toContain("sewa server VPS, domain, dan registrasi kompetisi");
    unmount();
    render(<EnglishTermsPage />);
    expect(text()).not.toMatch(/compute/i);
    expect(text()).toContain("VPS server rental, domains and competition registration");
  });
});
