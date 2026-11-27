import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AdminMembersClient from "../src/app/(portal)/admin/members/admin-members-client";

const member = {
  id: "1",
  full_name: "Exited Student",
  github_username: "exitedstudent",
  division: "builder",
  track: null,
  is_active: false,
  membership_status: "exited",
  membership_started_at: "2026-10-01T00:00:00.000Z",
  exited_at: "2026-11-01T00:00:00.000Z",
  reapply_blocked: true,
  intake_policy_version: "ubsi-2026-s1",
} as never;

describe("Admin membership lifecycle visibility", () => {
  it("renders exited status and reapply block", () => {
    render(<AdminMembersClient initialMembers={[member]} positions={null} />);
    expect(screen.getByText("Exited")).toBeDefined();
    expect(screen.getByText(/Tidak dapat daftar ulang/i)).toBeDefined();
    expect(screen.getByText("ubsi-2026-s1")).toBeDefined();
  });
});

describe("Admin table does not make applicants look like members", () => {
  // New applicants get membership_status "active" and is_active true by default, so those columns alone say nothing.
  const applicant = (status: "pending" | "rejected" | "approved") =>
    ({
      id: "2",
      full_name: "Some Applicant",
      github_username: "applicant",
      division: "builder",
      track: null,
      registration_status: status,
      is_active: status !== "rejected",
      membership_status: "active",
      reapply_blocked: false,
      hierarchy: "member",
      roles: [],
      titles: [],
      divisions: ["builder"],
      head_of: [],
      tracks: [],
    }) as never;

  it("shows a pending applicant as pending, not as an active member, and offers no access switch", () => {
    render(<AdminMembersClient initialMembers={[applicant("pending")]} positions={null} />);
    expect(screen.getByText("Pending")).toBeDefined();
    expect(screen.queryByText("Active")).toBeNull();
    expect(screen.queryByText("Aktif")).toBeNull();
    expect(screen.queryByRole("button", { name: "Nonaktifkan" })).toBeNull();
    expect(screen.getByText(/Belum menjadi anggota/i)).toBeDefined();
    expect(screen.queryByText("Grandfathered")).toBeNull();
    expect(screen.queryByText(/Historis/)).toBeNull();
  });

  it("shows a rejected applicant as rejected", () => {
    render(<AdminMembersClient initialMembers={[applicant("rejected")]} positions={null} />);
    expect(screen.getByText("Ditolak")).toBeDefined();
    expect(screen.queryByText("Active")).toBeNull();
    expect(screen.queryByRole("button", { name: /Nonaktifkan|Buka Blokir/ })).toBeNull();
  });

  it("keeps Active, Aktif and the access switch for an approved member", () => {
    render(<AdminMembersClient initialMembers={[applicant("approved")]} positions={null} />);
    expect(screen.getByText("Active")).toBeDefined();
    expect(screen.getByText("Aktif")).toBeDefined();
    expect(screen.getByRole("button", { name: "Nonaktifkan" })).toBeDefined();
    expect(screen.queryByText("Pending")).toBeNull();
  });
});

