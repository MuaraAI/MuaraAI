import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const deleteMock = vi.fn();
const regenerateMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("@/app/actions/sessions", () => ({
  createSession: vi.fn(),
  updateSession: vi.fn(),
  deleteSession: (...args: unknown[]) => deleteMock(...args),
  regenerateCheckinCode: (...args: unknown[]) => regenerateMock(...args),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));

import SessionsList, { type AdminSessionRow } from "../src/app/(portal)/admin/sessions/sessions-list";

const rows: AdminSessionRow[] = [
  {
    id: "s1",
    title: "Sharing PR pertama",
    type: "sharing",
    materi: "Cara membuka PR",
    startsAt: "2026-12-04T12:30:00.000Z",
    endsAt: "2026-12-04T15:00:00.000Z",
    discordUrl: "https://discord.gg/muaraai",
    code: "ABCD23",
    attendees: ["Budi", "Sari"],
  },
];

beforeEach(() => {
  vi.restoreAllMocks();
  deleteMock.mockReset().mockResolvedValue({ success: true });
  regenerateMock.mockReset().mockResolvedValue({ success: true, code: "ZZ9988" });
  refreshMock.mockReset();
});

describe("SessionsList", () => {
  it("shows the session, its WIB schedule, the code and who attended", () => {
    render(<SessionsList sessions={rows} />);
    expect(screen.getByText("Sharing PR pertama")).toBeTruthy();
    expect(screen.getByText(/19\.30 WIB/)).toBeTruthy();
    expect(screen.getByText("ABCD23")).toBeTruthy();
    expect(screen.getByText(/2 hadir/)).toBeTruthy();
    expect(screen.getByText(/Budi, Sari/)).toBeTruthy();
  });

  it("explains when there are no sessions yet", () => {
    render(<SessionsList sessions={[]} />);
    expect(screen.getByText("Belum ada sesi.")).toBeTruthy();
  });

  it("regenerates the code and shows the new one", async () => {
    render(<SessionsList sessions={rows} />);
    fireEvent.click(screen.getByRole("button", { name: /Buat ulang kode/i }));

    await waitFor(() => expect(regenerateMock).toHaveBeenCalledWith("s1"));
    expect(await screen.findByText("ZZ9988")).toBeTruthy();
    expect(screen.queryByText("ABCD23")).toBeNull();
  });

  it("deletes a session only after confirmation", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
    render(<SessionsList sessions={rows} />);

    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    expect(deleteMock).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    await waitFor(() => expect(deleteMock).toHaveBeenCalledWith("s1"));
    expect(confirm).toHaveBeenCalledTimes(2);
    await waitFor(() => expect(refreshMock).toHaveBeenCalled());
  });

  it("shows an error from the server instead of failing silently", async () => {
    deleteMock.mockResolvedValue({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
    vi.spyOn(window, "confirm").mockReturnValue(true);
    render(<SessionsList sessions={rows} />);
    fireEvent.click(screen.getByRole("button", { name: /Hapus/i }));
    expect((await screen.findByRole("alert")).textContent).toContain("Terjadi kesalahan");
  });
});
