import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import AdminMembersClient from "../src/app/(portal)/admin/members/admin-members-client";

const setMemberRole = vi.fn();
const notify = vi.fn();
let confirmAnswer = true;
const confirm = vi.fn(async () => confirmAnswer);

vi.mock("@/app/actions/admin", () => ({
  toggleMemberActive: vi.fn(),
  syncOrgCommits: vi.fn(),
  setMemberRole: (...args: unknown[]) => setMemberRole(...args),
}));
vi.mock("@/components/ui/feedback", () => ({ useFeedback: () => ({ confirm, notify, prompt: async () => null }) }));

const positions = { builder: ["Frontend", "Backend"], creative: ["Video"], cybersecurity: ["Pentester"] };
const person = (over: Record<string, unknown> = {}) =>
  ({
    id: "1",
    full_name: "Amel Tester",
    github_username: "ameltester",
    hierarchy: "member",
    roles: [],
    titles: [],
    division: "builder",
    divisions: ["builder"],
    head_of: [],
    tracks: [],
    is_active: true,
    membership_status: "active",
    reapply_blocked: false,
    ...over,
  }) as never;

const box = (label: string) => screen.getByRole("checkbox", { name: label }) as HTMLInputElement;

beforeEach(() => {
  setMemberRole.mockReset().mockResolvedValue({ success: true });
  notify.mockReset();
  confirm.mockClear();
  confirmAnswer = true;
});

describe("admin role editor", () => {
  it("saves access, divisions, heads, primary division and positions together", async () => {
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);

    fireEvent.click(box("Divisi Creative Amel Tester"));
    fireEvent.click(box("Divisi Cybersecurity Amel Tester"));
    fireEvent.click(box("Head of Creative Amel Tester"));
    fireEvent.click(box("Posisi Video Amel Tester"));
    fireEvent.click(box("Posisi Pentester Amel Tester"));
    fireEvent.change(screen.getByLabelText("Divisi utama Amel Tester"), { target: { value: "creative" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));

    await waitFor(() =>
      expect(setMemberRole).toHaveBeenCalledWith("1", {
        maintainer: false,
        divisions: ["builder", "creative", "cybersecurity"],
        primary: "creative",
        headOf: ["creative"],
        tracks: ["Video", "Pentester"],
      }),
    );
    expect(await screen.findAllByText("Head of Creative")).not.toHaveLength(0);
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });

  it("only offers positions and Head roles for the divisions the person is in, and drops them when a division is removed", () => {
    render(<AdminMembersClient initialMembers={[person({ divisions: ["builder", "creative"], head_of: ["creative"], tracks: ["Video", "Backend"] })]} positions={positions} />);
    expect(screen.queryByRole("checkbox", { name: "Posisi Pentester Amel Tester" })).toBeNull();
    expect(box("Head of Creative Amel Tester").checked).toBe(true);

    fireEvent.click(box("Divisi Creative Amel Tester"));
    expect(screen.queryByRole("checkbox", { name: "Head of Creative Amel Tester" })).toBeNull();
    expect(screen.queryByRole("checkbox", { name: "Posisi Video Amel Tester" })).toBeNull();
    expect(box("Posisi Backend Amel Tester").checked).toBe(true);
  });

  it("starts from what the person already is, and does nothing until something changes", () => {
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "maintainer", roles: ["maintainer"], divisions: ["builder", "creative"], head_of: ["builder"] })]} positions={positions} />);
    expect(box("Maintainer Amel Tester").checked).toBe(true);
    expect(box("Divisi Creative Amel Tester").checked).toBe(true);
    expect(box("Divisi Cybersecurity Amel Tester").checked).toBe(false);
    expect(box("Head of Builder Amel Tester").checked).toBe(true);
    expect((screen.getByRole("button", { name: "Simpan peran" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("will not save a person with no division", () => {
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    fireEvent.click(box("Divisi Builder Amel Tester"));
    expect((screen.getByRole("button", { name: "Simpan peran" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("does nothing when the admin declines the confirmation", async () => {
    confirmAnswer = false;
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    fireEvent.click(box("Divisi Creative Amel Tester"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(setMemberRole).not.toHaveBeenCalled();
  });

  it("warns that maintainer means full admin access, both when giving and when taking it", async () => {
    const { unmount } = render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    fireEvent.click(box("Maintainer Amel Tester"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ title: "Ubah akses maintainer?", message: expect.stringContaining("diberikan") })));
    unmount();

    confirm.mockClear();
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "maintainer", roles: ["maintainer"] })]} positions={positions} />);
    fireEvent.click(box("Maintainer Amel Tester"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));
    await waitFor(() => expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("dicabut") })));
  });

  it("shows the server's refusal and keeps the old role", async () => {
    setMemberRole.mockResolvedValue({ success: false, error: "Tidak bisa menurunkan maintainer terakhir." });
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "maintainer", roles: ["maintainer"] })]} positions={positions} />);
    fireEvent.click(box("Maintainer Amel Tester"));
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "error", message: "Tidak bisa menurunkan maintainer terakhir." })));
    expect(screen.getAllByText("Maintainer").length).toBeGreaterThan(0);
  });

  it("shows the role badges as plain text when the official positions are not set up", () => {
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "maintainer", roles: ["maintainer"], titles: ["Founder"], head_of: ["builder"] })]} positions={null} />);
    expect(screen.getByText("Founder · Maintainer · Head of Builder")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Simpan peran" })).toBeNull();
  });
});
