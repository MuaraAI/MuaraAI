import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import FadeIn from "../src/components/ui/fade-in";
import DataState from "../src/components/ui/data-state";

describe("shared UI motion and state primitives", () => {
  it("renders FadeIn content without requiring browser-only motion APIs", () => {
    render(<FadeIn>Content</FadeIn>);
    expect(screen.getByText("Content")).toBeTruthy();
  });

  it("renders an informative loading state", () => {
    render(
      <DataState
        kind="loading"
        title="Memuat materi"
        description="Materi sedang disiapkan."
      />,
    );
    expect(screen.getByRole("status").textContent).toContain("Memuat materi");
    expect(screen.getByText("Materi sedang disiapkan.")).toBeTruthy();
  });

  it("renders an informative empty state with its action", () => {
    render(
      <DataState
        kind="empty"
        title="Belum ada project"
        description="Tambahkan project pertama kamu untuk mulai membangun portofolio."
        action={<button type="button">Tambah project</button>}
      />,
    );
    expect(screen.getByText("Belum ada project")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Tambah project" })).toBeTruthy();
  });

  it("renders an informative error state", () => {
    render(
      <DataState
        kind="error"
        title="Materi belum tersedia"
        description="Coba muat ulang halaman atau kembali lagi nanti."
      />,
    );
    expect(screen.getByRole("alert").textContent).toContain("Materi belum tersedia");
    expect(screen.getByText("Coba muat ulang halaman atau kembali lagi nanti.")).toBeTruthy();
  });
});
