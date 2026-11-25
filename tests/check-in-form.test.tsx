import { beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";

const checkInMock = vi.fn();
vi.mock("@/app/actions/sessions", () => ({ checkInToSession: (...args: unknown[]) => checkInMock(...args) }));

import CheckInForm from "../src/components/portal/check-in-form";

beforeEach(() => {
  checkInMock.mockReset().mockResolvedValue({ success: true, title: "Sharing PR pertama" });
});

describe("CheckInForm", () => {
  it("sends the typed code and confirms the check-in", async () => {
    render(<CheckInForm />);
    fireEvent.change(screen.getByLabelText(/Kode check-in/i), { target: { value: "abc d23" } });
    fireEvent.click(screen.getByRole("button", { name: /Check-in/i }));

    await waitFor(() => expect(checkInMock).toHaveBeenCalledWith("abc d23"));
    expect((await screen.findByRole("status")).textContent).toContain("Berhasil check-in: Sharing PR pertama");
  });

  it("shows the server error in an alert", async () => {
    checkInMock.mockResolvedValue({ success: false, error: "Kode tidak valid, atau sesi belum dibuka / sudah selesai." });
    render(<CheckInForm />);
    fireEvent.change(screen.getByLabelText(/Kode check-in/i), { target: { value: "ZZZZZZ" } });
    fireEvent.click(screen.getByRole("button", { name: /Check-in/i }));

    expect((await screen.findByRole("alert")).textContent).toContain("Kode tidak valid");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("disables the button while the request is running", async () => {
    let finish: (value: unknown) => void = () => {};
    checkInMock.mockReturnValue(new Promise((resolve) => (finish = resolve)));
    render(<CheckInForm />);
    fireEvent.change(screen.getByLabelText(/Kode check-in/i), { target: { value: "ABCD23" } });
    fireEvent.click(screen.getByRole("button", { name: /Check-in/i }));

    await waitFor(() => expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(true));
    await act(async () => finish({ success: true, title: "X" }));
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
  });

  it("unlocks the button and shows an error when the server action throws", async () => {
    checkInMock.mockRejectedValue(new Error("network down"));
    render(<CheckInForm />);
    fireEvent.change(screen.getByLabelText(/Kode check-in/i), { target: { value: "ABCD23" } });
    fireEvent.click(screen.getByRole("button", { name: /Check-in/i }));

    expect((await screen.findByRole("alert")).textContent).toContain("Check-in gagal");
    expect((screen.getByRole("button") as HTMLButtonElement).disabled).toBe(false);
  });

  it("does not call the server for an empty code", () => {
    render(<CheckInForm />);
    fireEvent.click(screen.getByRole("button", { name: /Check-in/i }));
    expect(checkInMock).not.toHaveBeenCalled();
  });
});
