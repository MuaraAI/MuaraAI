import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ContributionsTable, { type ContributionRow } from "../src/app/(portal)/admin/contributions/contributions-table";
import { DEFAULT_RULES } from "../src/lib/contributions/rules";

const row = (over: Partial<ContributionRow> = {}): ContributionRow => ({
  id: "m1",
  name: "Budi Santoso",
  github: "budi",
  division: "builder",
  standing: "good",
  stats: { mergedPrs: 4, externalPrs: 2, commits: 20, newRepos: 0, newWorks: 0 },
  lastEvaluation: null,
  ...over,
});

describe("ContributionsTable", () => {
  it("shows a builder's progress against every builder target", () => {
    render(<ContributionsTable rows={[row()]} rules={DEFAULT_RULES} />);
    expect(screen.getByText("Budi Santoso")).toBeTruthy();
    expect(screen.getByText("@budi")).toBeTruthy();
    const progress = screen.getByText(/PR 4\/10/).textContent ?? "";
    for (const part of ["PR 4/10", "Eksternal 2/5", "Commit 20/50", "Repo baru 0/1"]) expect(progress).toContain(part);
    expect(screen.getByText("Baik")).toBeTruthy();
  });

  it("does not show commits for a creative but shows new works", () => {
    render(
      <ContributionsTable
        rows={[row({ division: "creative", stats: { mergedPrs: 10, externalPrs: 5, commits: 0, newRepos: 0, newWorks: 1 } })]}
        rules={DEFAULT_RULES}
      />
    );
    const progress = screen.getByText(/PR 10\/10/).textContent ?? "";
    expect(progress).not.toContain("Commit");
    expect(progress).toContain("Karya baru 1/1");
  });

  it("marks warned members and describes the last evaluation, including dry runs", () => {
    render(
      <ContributionsTable
        rows={[row({ standing: "warned", lastEvaluation: { month: "2026-11-01", met: false, action: "warn", enforced: false } })]}
        rules={DEFAULT_RULES}
      />
    );
    expect(screen.getByText("Diperingatkan")).toBeTruthy();
    const evaluation = screen.getByText(/November 2026/).textContent ?? "";
    expect(evaluation).toContain("belum memenuhi");
    expect(evaluation).toContain("dry run");
  });

  it("handles members without data and an empty list", () => {
    const { unmount } = render(<ContributionsTable rows={[row({ stats: null })]} rules={DEFAULT_RULES} />);
    expect(screen.getByText("Belum ada data")).toBeTruthy();
    unmount();
    render(<ContributionsTable rows={[]} rules={DEFAULT_RULES} />);
    expect(screen.getByText("Belum ada anggota.")).toBeTruthy();
  });
});
