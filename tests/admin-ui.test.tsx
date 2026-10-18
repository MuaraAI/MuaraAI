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
});
