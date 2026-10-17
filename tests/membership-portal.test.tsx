import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import MembershipExitClient from "../src/components/portal/membership-exit-client";

describe("Membership exit portal", () => {
  it("shows exited status without a re-apply button", () => {
    render(
      <MembershipExitClient
        status="exited"
        exitedAt="2026-11-01T00:00:00.000Z"
        earliestExitAt={null}
      />
    );
    expect(screen.getByText(/Riwayat Member/i)).toBeDefined();
    expect(screen.queryByRole("button", { name: /Ajukan Keluar/i })).toBeNull();
    expect(screen.queryByText(/daftar ulang/i)).toBeDefined();
  });

  it("disables exit request before the earliest date", () => {
    render(
      <MembershipExitClient
        status="active"
        exitedAt={null}
        earliestExitAt="2099-10-31T00:00:00.000Z"
      />
    );
    expect(screen.getByRole("button", { name: /Ajukan Keluar/i })).toHaveProperty("disabled", true);
  });
});
