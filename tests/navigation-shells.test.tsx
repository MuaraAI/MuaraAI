import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Navbar from "../src/components/landing/navbar";
import MemberShell from "../src/components/portal/member-shell";
import AdminShell from "../src/components/portal/admin-shell";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

describe("navigation shells", () => {
  it("uses concise public destinations", () => {
    render(<Navbar />);

    expect(screen.getAllByText("Project").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Anggota").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Cara Gabung").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Masuk").length).toBeGreaterThan(0);
    expect(screen.queryByText("Accolades")).toBeNull();
    expect(screen.queryByText("Manifesto")).toBeNull();
    expect(screen.queryByText("Treasury")).toBeNull();
  });

  it("renders member workspace destinations", () => {
    render(
      <MemberShell
        member={{ full_name: "Yuken", github_username: "Curzyori", is_active: true }}
      >
        <p>Member content</p>
      </MemberShell>,
    );

    expect(screen.getByText("Beranda")).toBeTruthy();
    expect(screen.getByText("Belajar")).toBeTruthy();
    expect(screen.getByText("Project")).toBeTruthy();
    expect(screen.getByText("Akses")).toBeTruthy();
    expect(screen.getByText("Akun")).toBeTruthy();
    expect(screen.getByText("Member content")).toBeTruthy();
  });

  it("renders maintainer operations destinations", () => {
    render(
      <AdminShell>
        <p>Operations content</p>
      </AdminShell>,
    );

    expect(screen.getByText("Overview")).toBeTruthy();
    expect(screen.getByText("Review pendaftar")).toBeTruthy();
    expect(screen.getByText("Anggota")).toBeTruthy();
    expect(screen.getByText("Kas")).toBeTruthy();
    expect(screen.getByText("Materi")).toBeTruthy();
    expect(screen.getByText("Pesan")).toBeTruthy();
    expect(screen.getByText("Prestasi")).toBeTruthy();
    expect(screen.getByText("Operations content")).toBeTruthy();
  });
});
