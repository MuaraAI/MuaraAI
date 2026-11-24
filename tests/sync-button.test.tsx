import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";

const syncMock = vi.fn();
const refreshMock = vi.fn();
vi.mock("@/app/actions/admin", () => ({ syncContributionsNow: (...args: unknown[]) => syncMock(...args) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: refreshMock }) }));

import SyncButton from "../src/app/(portal)/admin/contributions/sync-button";

beforeEach(() => {
  syncMock.mockReset();
  refreshMock.mockReset();
});

describe("SyncButton", () => {
  it("syncs, reports the result, and refreshes the page data", async () => {
    syncMock.mockResolvedValue({ success: true, summary: { synced: 3, skipped: 1 } });
    render(<SyncButton />);
    fireEvent.click(screen.getByRole("button", { name: /Sinkronkan sekarang/i }));

    expect(await screen.findByText("Tersinkron: 3 anggota (1 dilewati).")).toBeTruthy();
    expect(refreshMock).toHaveBeenCalledTimes(1);
  });

  it("shows the error and does not refresh when the sync fails", async () => {
    syncMock.mockResolvedValue({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
    render(<SyncButton />);
    fireEvent.click(screen.getByRole("button", { name: /Sinkronkan sekarang/i }));

    expect(await screen.findByText("Terjadi kesalahan pada server. Silakan coba lagi.")).toBeTruthy();
    expect(refreshMock).not.toHaveBeenCalled();
  });
});
