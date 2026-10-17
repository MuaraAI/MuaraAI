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
  dues_valid_until: null,
  is_active: false,
  membership_status: "exited",
  membership_started_at: "2026-10-01T00:00:00.000Z",
  exited_at: "2026-11-01T00:00:00.000Z",
  reapply_blocked: true,
  intake_policy_version: "ubsi-2026-s1",
} as never;

describe("Admin membership lifecycle visibility", () => {
  it("renders exited status and reapply block", () => {
    render(<AdminMembersClient initialMembers={[member]} />);
    expect(screen.getByText("Exited")).toBeDefined();
    expect(screen.getByText(/Tidak dapat daftar ulang/i)).toBeDefined();
    expect(screen.getByText("ubsi-2026-s1")).toBeDefined();
  });
});
