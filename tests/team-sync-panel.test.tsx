import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const previewTeamSync = vi.fn();
const applyTeamSync = vi.fn();
const notify = vi.fn();
let confirmAnswer = true;
const confirm = vi.fn(async () => confirmAnswer);

vi.mock("@/app/actions/admin", () => ({
  previewTeamSync: () => previewTeamSync(),
  applyTeamSync: () => applyTeamSync(),
}));
vi.mock("@/components/ui/feedback", () => ({ useFeedback: () => ({ confirm, notify, prompt: async () => null }) }));

import TeamSyncPanel from "../src/app/(portal)/admin/members/team-sync-panel";

const plan = {
  create: [{ slug: "head-cybersecurity", parent: "heads" }],
  add: [{ team: "heads", user: "verzio" }, { team: "member-builder", user: "plain" }],
  remove: [{ team: "head-creative", user: "yuken" }],
  unknown: ["greeezzz"],
};

beforeEach(() => {
  previewTeamSync.mockReset().mockResolvedValue({ success: true, plan });
  applyTeamSync.mockReset().mockResolvedValue({ success: true, applied: { created: 1, added: 2, invited: 0, removed: 1 }, failures: [] });
  notify.mockReset();
  confirm.mockClear();
  confirmAnswer = true;
});

const show = async () => {
  render(<TeamSyncPanel />);
  fireEvent.click(screen.getByRole("button", { name: /Lihat rencana sinkron/ }));
  await screen.findByText("Tim yang akan dibuat");
};

describe("team sync panel", () => {
  it("shows what would be created, added and removed, and who is left alone, without changing anything", async () => {
    await show();
    expect(screen.getByText(/head-cybersecurity \(di bawah heads\)/)).toBeTruthy();
    expect(screen.getByText("@verzio ke heads")).toBeTruthy();
    expect(screen.getByText("@yuken dari head-creative")).toBeTruthy();
    expect(screen.getByText(/tidak disentuh: @greeezzz/)).toBeTruthy();
    expect(applyTeamSync).not.toHaveBeenCalled();
  });

  it("applies only after the admin confirms, then reports and refreshes the plan", async () => {
    await show();
    previewTeamSync.mockResolvedValue({ success: true, plan: { create: [], add: [], remove: [], unknown: ["greeezzz"] } });

    fireEvent.click(screen.getByRole("button", { name: "Terapkan ke GitHub" }));

    await waitFor(() => expect(applyTeamSync).toHaveBeenCalledTimes(1));
    expect(confirm).toHaveBeenCalledWith(expect.objectContaining({ message: expect.stringContaining("1 tim dibuat, 2 orang ditambahkan, 1 orang dikeluarkan") }));
    expect(await screen.findByText("Tim GitHub sudah sesuai dengan peran di web.")).toBeTruthy();
    expect(screen.getByRole("status").textContent).toContain("1 tim dibuat, 2 orang ditambahkan, 1 dikeluarkan.");
    expect(notify).toHaveBeenCalledWith(expect.objectContaining({ tone: "success" }));
  });

  it("tells the admin when new people were only invited to the org", async () => {
    applyTeamSync.mockResolvedValue({ success: true, applied: { created: 0, added: 1, invited: 2, removed: 0 }, failures: [] });
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Terapkan ke GitHub" }));
    expect((await screen.findByRole("status")).textContent).toContain("2 orang baru diundang ke org dan baru masuk tim setelah menerima undangan.");
  });

  it("does nothing when the admin declines", async () => {
    confirmAnswer = false;
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Terapkan ke GitHub" }));
    await waitFor(() => expect(confirm).toHaveBeenCalled());
    expect(applyTeamSync).not.toHaveBeenCalled();
  });

  it("lists each change that failed", async () => {
    applyTeamSync.mockResolvedValue({ success: false, applied: { created: 1, added: 1, invited: 0, removed: 0 }, failures: [{ action: "add", team: "heads", user: "verzio" }] });
    await show();
    fireEvent.click(screen.getByRole("button", { name: "Terapkan ke GitHub" }));

    expect(await screen.findByText("Gagal menambahkan @verzio di heads")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toContain("Sebagian gagal");
  });

  it("shows the server's message when the plan cannot be read, and an all-clear when nothing differs", async () => {
    previewTeamSync.mockResolvedValue({ success: false, error: "GITHUB_ORG_TOKEN belum diatur di server." });
    const { unmount } = render(<TeamSyncPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Lihat rencana sinkron/ }));
    expect((await screen.findByRole("alert")).textContent).toBe("GITHUB_ORG_TOKEN belum diatur di server.");
    unmount();

    previewTeamSync.mockResolvedValue({ success: true, plan: { create: [], add: [], remove: [], unknown: [] } });
    render(<TeamSyncPanel />);
    fireEvent.click(screen.getByRole("button", { name: /Lihat rencana sinkron/ }));
    expect(await screen.findByText("Tim GitHub sudah sesuai dengan peran di web.")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Terapkan ke GitHub" })).toBeNull();
  });
});
