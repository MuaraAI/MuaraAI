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

const positions = { builder: ["Frontend", "Backend"], creative: ["Video"] };
const person = (over: Record<string, unknown> = {}) =>
  ({
    id: "1",
    full_name: "Amel Tester",
    github_username: "ameltester",
    hierarchy: "member",
    division: "builder",
    track: null,
    is_active: true,
    membership_status: "active",
    reapply_blocked: false,
    ...over,
  }) as never;

beforeEach(() => {
  setMemberRole.mockReset().mockResolvedValue({ success: true });
  notify.mockReset();
  confirm.mockClear();
  confirmAnswer = true;
});

describe("admin role editor", () => {
  it("saves rank, division and position together and shows the new role name", async () => {
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    expect(screen.getByText("Member", { selector: "div.font-bold" })).toBeTruthy();

    fireEvent.change(screen.getByLabelText("Peringkat Amel Tester"), { target: { value: "head" } });
    fireEvent.change(screen.getByLabelText("Divisi Amel Tester"), { target: { value: "creative" } });
    fireEvent.change(screen.getByLabelText("Posisi Amel Tester"), { target: { value: "Video" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));

    await waitFor(() => expect(setMemberRole).toHaveBeenCalledWith("1", { hierarchy: "head", division: "creative", track: "Video" }));
    expect(await screen.findByText("Head of Creative")).toBeTruthy();
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });

  it("only offers the positions of the chosen division, and clears the position when the division changes", () => {
    render(<AdminMembersClient initialMembers={[person({ track: "Frontend" })]} positions={positions} />);
    const position = screen.getByLabelText("Posisi Amel Tester") as HTMLSelectElement;
    expect(Array.from(position.options).map((option) => option.value)).toEqual(["", "Frontend", "Backend"]);

    fireEvent.change(screen.getByLabelText("Divisi Amel Tester"), { target: { value: "creative" } });
    expect(Array.from((screen.getByLabelText("Posisi Amel Tester") as HTMLSelectElement).options).map((option) => option.value)).toEqual(["", "Video"]);
    expect((screen.getByLabelText("Posisi Amel Tester") as HTMLSelectElement).value).toBe("");
  });

  it("does nothing until something changed, and nothing when the admin declines the confirmation", async () => {
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    const save = screen.getByRole("button", { name: "Simpan peran" }) as HTMLButtonElement;
    expect(save.disabled).toBe(true);

    confirmAnswer = false;
    fireEvent.change(screen.getByLabelText("Peringkat Amel Tester"), { target: { value: "lead" } });
    fireEvent.click(save);
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(setMemberRole).not.toHaveBeenCalled();
  });

  it("warns that maintainer means full admin access", async () => {
    render(<AdminMembersClient initialMembers={[person()]} positions={positions} />);
    fireEvent.change(screen.getByLabelText("Peringkat Amel Tester"), { target: { value: "maintainer" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));

    await waitFor(() => expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ title: "Ubah akses maintainer?" })));
  });

  it("shows the server's refusal and keeps the old role", async () => {
    setMemberRole.mockResolvedValue({ success: false, error: "Tidak bisa menurunkan maintainer terakhir." });
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "maintainer" })]} positions={positions} />);
    fireEvent.change(screen.getByLabelText("Peringkat Amel Tester"), { target: { value: "member" } });
    fireEvent.click(screen.getByRole("button", { name: "Simpan peran" }));

    await waitFor(() => expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "error", message: "Tidak bisa menurunkan maintainer terakhir." })));
    expect(screen.getAllByText("Maintainer").length).toBeGreaterThan(0);
  });

  it("shows the role as plain text when the official positions are not set up", () => {
    render(<AdminMembersClient initialMembers={[person({ hierarchy: "lead" })]} positions={null} />);
    expect(screen.getByText("Builder Lead")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Simpan peran" })).toBeNull();
  });
});
