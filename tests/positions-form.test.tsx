import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const updatePositionsMock = vi.fn();
vi.mock("@/app/actions/admin", () => ({
  updatePositions: (...args: unknown[]) => updatePositionsMock(...args),
}));

import PositionsForm from "../src/app/(portal)/admin/settings/positions-form";

const initial = { builder: ["Web", "Backend"], creative: ["Video"] };

beforeEach(() => {
  updatePositionsMock.mockReset().mockResolvedValue({ success: true });
});

describe("PositionsForm", () => {
  it("shows one position per line for each division", () => {
    render(<PositionsForm initial={initial} />);
    expect((screen.getByLabelText(/Builder/i) as HTMLTextAreaElement).value).toBe("Web\nBackend");
    expect((screen.getByLabelText(/Creative/i) as HTMLTextAreaElement).value).toBe("Video");
    expect((screen.getByLabelText(/Cybersecurity/i) as HTMLTextAreaElement).value).toBe("");
  });

  it("saves the Cybersecurity positions too", async () => {
    render(<PositionsForm initial={initial} />);
    fireEvent.change(screen.getByLabelText(/Cybersecurity/i), { target: { value: "Pentester\nCTF Player" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan/i }));

    await waitFor(() => expect(updatePositionsMock).toHaveBeenCalledWith({ builder: ["Web", "Backend"], creative: ["Video"], cybersecurity: ["Pentester", "CTF Player"] }));
  });

  it("saves the edited lists, one position per non-empty line", async () => {
    render(<PositionsForm initial={initial} />);
    fireEvent.change(screen.getByLabelText(/Builder/i), { target: { value: "Web\n\n  Game \n" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan/i }));

    await waitFor(() => expect(updatePositionsMock).toHaveBeenCalledTimes(1));
    expect(updatePositionsMock).toHaveBeenCalledWith({ builder: ["Web", "Game"], creative: ["Video"], cybersecurity: [] });
    expect(await screen.findByText("Posisi tersimpan.")).toBeTruthy();
  });

  it("shows the server error and keeps the form editable", async () => {
    updatePositionsMock.mockResolvedValue({ success: false, error: "Setiap divisi harus punya minimal satu posisi." });
    render(<PositionsForm initial={initial} />);
    fireEvent.change(screen.getByLabelText(/Creative/i), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan/i }));

    expect(await screen.findByText("Setiap divisi harus punya minimal satu posisi.")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Simpan/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
