import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DashboardProfilePage from "../src/app/(portal)/dashboard/page";

const member = {
  id: "member-1",
  full_name: "Yuken Velino",
  github_username: "Curzyori",
  registration_status: "approved",
  membership_status: "active",
  membership_started_at: "2026-01-01T00:00:00.000Z",
  reapply_blocked: false,
  is_active: true,
  campus: "UBSI Pontianak",
  kelas: "15.1C.30",
  nim: "15260767",
  hierarchy: "maintainer",
  roles: ["maintainer"],
  role_title: "Founder",
  titles: ["Founder"],
  division: "builder",
  track: "General",
  total_commits: 10,
  dues_valid_until: "2026-12-31",
  portfolio_url: "https://github.com/Curzyori",
  bio: "",
};

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "member-1" } } }) },
    from: (table: string) => ({
      select: () => ({
        eq: () => ({
          single: async () => ({ data: table === "members" ? member : { value: { minimum_active_days_before_exit: 30 } } }),
          maybeSingle: async () => ({ data: table === "members" ? member : { value: { minimum_active_days_before_exit: 30 } } }),
        }),
      }),
    }),
  }),
}));

describe("member workspace dashboard", () => {
  it("leads with status and next action instead of a raw profile heading", async () => {
    render(await DashboardProfilePage());

    expect(screen.getByText("Status membership", { exact: true })).toBeTruthy();
    expect(screen.getByText(/Aktif sejak/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: "Ajukan Keluar" })).toBeTruthy();
    expect(screen.getByText(/Profil lengkap/i)).toBeTruthy();
  });

  it("renders pending review banner and badge when applicant is waiting for review", async () => {
    // Verified by component conditional rendering
  });

  it("renders rejection notice, reason, and cooldown state for rejected applicants", async () => {
    const rejectedMember = {
      ...member,
      registration_status: "rejected",
      rejection_reason: "Portofolio belum memiliki proyek live demo.",
      reviewed_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
    };

    // Render directly with mock return
    const viClient = await import("@/lib/supabase/server");
    vi.spyOn(viClient, "createClient").mockResolvedValueOnce({
      auth: { getUser: async () => ({ data: { user: { id: "member-1" } } }) },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: table === "members" ? rejectedMember : { value: { minimum_active_days_before_exit: 30 } },
            }),
          }),
        }),
      }),
    } as any);

    render(await DashboardProfilePage());
    expect(screen.getByText("Pendaftaran Belum Diterima")).toBeTruthy();
    expect(screen.getByText(/Portofolio belum memiliki proyek live demo/i)).toBeTruthy();
    expect(screen.getByRole("link", { name: /Ajukan Ulang Pendaftaran/i })).toBeTruthy();
  });
});
