import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { DEFAULT_RULES } from "../src/lib/contributions/rules";

const updateMock = vi.fn();
vi.mock("@/app/actions/admin", () => ({
  updateContributionRules: (...args: unknown[]) => updateMock(...args),
}));

import RulesForm from "../src/app/(portal)/admin/settings/rules-form";

beforeEach(() => {
  updateMock.mockReset().mockResolvedValue({ success: true });
});

describe("RulesForm", () => {
  it("shows the current mode and targets", () => {
    render(<RulesForm initial={DEFAULT_RULES} />);
    expect((screen.getByLabelText(/Mode penegakan/i) as HTMLSelectElement).value).toBe("dry_run");
    expect((screen.getByLabelText(/Builder: PR ter-merge/i) as HTMLInputElement).value).toBe("10");
    expect((screen.getByLabelText(/Builder: commit/i) as HTMLInputElement).value).toBe("50");
    expect((screen.getByLabelText(/Creative: karya baru/i) as HTMLInputElement).value).toBe("1");
    expect((screen.getByLabelText(/Label karya baru/i) as HTMLInputElement).value).toBe("karya-baru");
  });

  it("saves edited values as numbers", async () => {
    render(<RulesForm initial={DEFAULT_RULES} />);
    fireEvent.change(screen.getByLabelText(/Mode penegakan/i), { target: { value: "warn_only" } });
    fireEvent.change(screen.getByLabelText(/Builder: PR ter-merge/i), { target: { value: "12" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan aturan/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock).toHaveBeenCalledWith({
      ...DEFAULT_RULES,
      enforcement: "warn_only",
      builder: { ...DEFAULT_RULES.builder, mergedPrs: 12 },
    });
    expect(await screen.findByText("Aturan tersimpan.")).toBeTruthy();
  });

  it("shows and saves the tier multipliers as numbers", async () => {
    render(<RulesForm initial={DEFAULT_RULES} />);
    expect((screen.getByLabelText(/Pengali Arus/i) as HTMLInputElement).value).toBe("1.5");
    expect((screen.getByLabelText(/Pengali Pasang/i) as HTMLInputElement).value).toBe("2");
    expect((screen.getByLabelText(/Pengali Samudra/i) as HTMLInputElement).value).toBe("3");

    fireEvent.change(screen.getByLabelText(/Pengali Samudra/i), { target: { value: "4" } });
    fireEvent.click(screen.getByRole("button", { name: /Simpan aturan/i }));

    await waitFor(() => expect(updateMock).toHaveBeenCalledTimes(1));
    expect(updateMock.mock.calls[0][0].tierMultipliers).toEqual({ arus: 1.5, pasang: 2, samudra: 4 });
  });

  it("warns that full mode removes members automatically", () => {
    render(<RulesForm initial={DEFAULT_RULES} />);
    expect(screen.queryByText(/otomatis mengeluarkan anggota/i)).toBeNull();
    fireEvent.change(screen.getByLabelText(/Mode penegakan/i), { target: { value: "full" } });
    expect(screen.getByText(/otomatis mengeluarkan anggota/i)).toBeTruthy();
  });

  it("shows the server error and stays editable", async () => {
    updateMock.mockResolvedValue({ success: false, error: "Nilai target harus bilangan bulat 0–1000." });
    render(<RulesForm initial={DEFAULT_RULES} />);
    fireEvent.click(screen.getByRole("button", { name: /Simpan aturan/i }));

    expect(await screen.findByText("Nilai target harus bilangan bulat 0–1000.")).toBeTruthy();
    expect((screen.getByRole("button", { name: /Simpan aturan/i }) as HTMLButtonElement).disabled).toBe(false);
  });
});
