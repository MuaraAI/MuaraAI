import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import ContributionCard from "../src/components/portal/contribution-card";
import { DEFAULT_RULES } from "../src/lib/contributions/rules";

const stats = { mergedPrs: 4, externalPrs: 5, commits: 20, newRepos: 0, newWorks: 0 };

describe("ContributionCard", () => {
  it("shows each builder metric against its target and marks the ones already reached", () => {
    render(<ContributionCard division="builder" stats={stats} rules={DEFAULT_RULES} standing="good" month="2026-12-01" />);

    expect(screen.getByText(/Desember 2026/)).toBeTruthy();
    for (const progress of ["4/10", "5/5", "20/50", "0/1"]) expect(screen.getByText(progress)).toBeTruthy();
    expect(screen.getAllByText("Tercapai")).toHaveLength(1);
  });

  it("asks a creative for a new work instead of commits", () => {
    render(
      <ContributionCard division="creative" stats={{ ...stats, newWorks: 1, mergedPrs: 10 }} rules={DEFAULT_RULES} standing="good" month="2026-12-01" />
    );

    expect(screen.queryByText(/Commit/i)).toBeNull();
    expect(screen.getByText(/Karya baru/i)).toBeTruthy();
    expect(screen.getByText("10/10")).toBeTruthy();
  });

  it("shows the warning banner only when the member was warned", () => {
    const { unmount } = render(<ContributionCard division="builder" stats={stats} rules={DEFAULT_RULES} standing="warned" month="2026-12-01" />);
    expect(screen.getByRole("alert").textContent).toContain("Bulan lalu belum memenuhi target");
    unmount();

    render(<ContributionCard division="builder" stats={stats} rules={DEFAULT_RULES} standing="good" month="2026-12-01" />);
    expect(screen.queryByRole("alert")).toBeNull();
  });

  it("explains when there is no data yet", () => {
    render(<ContributionCard division="builder" stats={null} rules={DEFAULT_RULES} standing="good" month="2026-12-01" />);
    expect(screen.getByText(/Belum ada data/i)).toBeTruthy();
    expect(screen.queryByText("0/10")).toBeNull();
  });
});
