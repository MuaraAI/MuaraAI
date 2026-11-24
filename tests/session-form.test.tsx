import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const createMock = vi.fn();
const updateMock = vi.fn();
vi.mock("@/app/actions/sessions", () => ({
  createSession: (...args: unknown[]) => createMock(...args),
  updateSession: (...args: unknown[]) => updateMock(...args),
}));

import SessionForm from "../src/app/(portal)/admin/sessions/session-form";

const row = {
  id: "s1",
  title: "Diskusi PR",
  type: "diskusi",
  materi: "Bahas review",
  startsAt: "2026-12-04T12:30:00.000Z",
  endsAt: "2026-12-04T15:00:00.000Z",
  discordUrl: "https://discord.gg/muaraai",
  code: "ABCD23",
  attendees: [],
};

beforeEach(() => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-03T10:00:00Z")); // Thursday: the next Friday is 2026-12-04
  createMock.mockReset().mockResolvedValue({ success: true, id: "s9", code: "ZZZ999" });
  updateMock.mockReset().mockResolvedValue({ success: true });
});

afterEach(() => vi.useRealTimers());

describe("SessionForm", () => {
  it("starts a new session on the next Friday 19:30-22:00 WIB", () => {
    render(<SessionForm onDone={() => {}} />);
    expect((screen.getByLabelText(/Mulai/i) as HTMLInputElement).value).toBe("2026-12-04T19:30");
    expect((screen.getByLabelText(/Selesai/i) as HTMLInputElement).value).toBe("2026-12-04T22:00");
  });

  it("creates a session with UTC times converted from WIB and tells the parent", async () => {
    const onDone = vi.fn();
    render(<SessionForm onDone={onDone} />);
    fireEvent.change(screen.getByLabelText(/Judul/i), { target: { value: "Sharing PR pertama" } });
    fireEvent.change(screen.getByLabelText(/Tipe/i), { target: { value: "sharing" } });
    fireEvent.change(screen.getByLabelText(/Materi/i), { target: { value: "Cara membuka PR" } });
    fireEvent.change(screen.getByLabelText(/Link Discord/i), { target: { value: "https://discord.gg/muaraai" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan sesi/i }));

    await waitFor(() => expect(createMock).toHaveBeenCalledTimes(1));
    expect(createMock).toHaveBeenCalledWith({
      title: "Sharing PR pertama",
      type: "sharing",
      materi: "Cara membuka PR",
      startsAt: "2026-12-04T12:30:00.000Z",
      endsAt: "2026-12-04T15:00:00.000Z",
      discordUrl: "https://discord.gg/muaraai",
    });
    await waitFor(() => expect(onDone).toHaveBeenCalled());
  });

  it("shows the server error and stays editable", async () => {
    createMock.mockResolvedValue({ success: false, error: "Link Discord harus https dari discord.gg atau discord.com." });
    const onDone = vi.fn();
    render(<SessionForm onDone={onDone} />);
    fireEvent.click(screen.getByRole("button", { name: /Simpan sesi/i }));

    expect((await screen.findByRole("alert")).textContent).toContain("Link Discord harus https");
    expect(onDone).not.toHaveBeenCalled();
    expect((screen.getByLabelText(/Judul/i) as HTMLInputElement).disabled).toBe(false);
  });

  it("unlocks the form and shows an error when the server action throws", async () => {
    createMock.mockRejectedValue(new Error("network down"));
    render(<SessionForm onDone={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: /Simpan sesi/i }));

    expect((await screen.findByRole("alert")).textContent).toContain("Gagal menyimpan");
    expect((screen.getByRole("button", { name: /Simpan sesi/i }) as HTMLButtonElement).disabled).toBe(false);
  });

  it("clears a new session form after it was saved, so a second click cannot duplicate it", async () => {
    render(<SessionForm onDone={() => {}} />);
    fireEvent.change(screen.getByLabelText(/Judul/i), { target: { value: "Sharing PR pertama" } });
    fireEvent.change(screen.getByLabelText(/Link Discord/i), { target: { value: "https://discord.gg/muaraai" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan sesi/i }));

    await waitFor(() => expect((screen.getByLabelText(/Judul/i) as HTMLInputElement).value).toBe(""));
    expect((screen.getByLabelText(/Link Discord/i) as HTMLInputElement).value).toBe("");
  });

  it("edits an existing session with its current values and calls updateSession", async () => {
    render(<SessionForm initial={row} onDone={() => {}} />);
    expect((screen.getByLabelText(/Judul/i) as HTMLInputElement).value).toBe("Diskusi PR");
    expect((screen.getByLabelText(/Mulai/i) as HTMLInputElement).value).toBe("2026-12-04T19:30");

    fireEvent.change(screen.getByLabelText(/Judul/i), { target: { value: "Diskusi PR lanjutan" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan sesi/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0]).toBe("s1");
    expect(updateMock.mock.calls[0][1]).toMatchObject({ title: "Diskusi PR lanjutan", startsAt: "2026-12-04T12:30:00.000Z" });
    expect(createMock).not.toHaveBeenCalled();
  });
});
