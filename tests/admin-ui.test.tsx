import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ReviewQueueClient from "../src/app/(portal)/admin/review/review-queue-client";
import type { Member } from "../src/types/database";

const applicant = {
  id: "m1", full_name: "Yuken Velino", github_username: "Curzyori", division: "builder",
  track: "AI Gateway & Systems Architecture", bio: "marketing bio", created_at: "2026-01-01T00:00:00Z",
  campus: "UBSI Pontianak", nim: "15260767", prodi: "Informatika", kelas: "15.1C.30",
  phone_wa: "0800000000", portfolio_url: "https://github.com/Curzyori",
  affiliation: "umum", telegram_username: "yukenv",
  join_reason: "Saya ingin belajar dan membangun project bersama komunitas ini.",
  secondary_division: "creative", secondary_track: "Video",
} as unknown as Member;

describe("maintainer review workspace", () => {
  it("shows applicant decision data without marketing bio copy", () => {
    render(<ReviewQueueClient initialMembers={[applicant]} />);
    expect(screen.getByText("Yuken Velino")).toBeTruthy();
    expect(screen.getByText("UBSI Pontianak")).toBeTruthy();
    expect(screen.getByRole("button", { name: /Approve/i })).toBeTruthy();
    expect(screen.getByRole("button", { name: /Tolak/i })).toBeTruthy();
    expect(screen.queryByText("marketing bio")).toBeNull();
  });

  it("shows status, institution, position, contacts, and the join reason without student-only fields", () => {
    render(<ReviewQueueClient initialMembers={[applicant]} />);
    expect(screen.getByText("Umum")).toBeTruthy();
    expect(screen.getByText("Saya ingin belajar dan membangun project bersama komunitas ini.")).toBeTruthy();
    expect(screen.getByText("@yukenv")).toBeTruthy();
    expect(screen.getByText(/CREATIVE \(Video\)/)).toBeTruthy();
    for (const legacy of [/NIM/, /Program Studi/, /Kode Kelas/, /Kampus Asal/]) {
      expect(screen.queryByText(legacy)).toBeNull();
    }
    expect(screen.queryByText("15260767")).toBeNull();
  });

  it("renders legacy applicants that have no join reason", () => {
    render(<ReviewQueueClient initialMembers={[{ ...applicant, join_reason: null } as unknown as Member]} />);
    expect(screen.getByText("Belum diisi")).toBeTruthy();
  });
});
