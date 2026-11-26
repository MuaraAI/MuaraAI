import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import ContributionCard from "../src/components/portal/contribution-card";
import CheckInForm from "../src/components/portal/check-in-form";
import MembershipExitClient from "../src/components/portal/membership-exit-client";
import LearnFeedClient from "../src/app/(portal)/dashboard/learn/learn-feed-client";
import { canRequestExit } from "../src/lib/membership";
import { monthLabel, parseRules } from "../src/lib/contributions/rules";
import { formatWib } from "../src/lib/sessions/sessions";
import { PORTAL_COPY } from "../src/lib/portal-copy";

const checkIn = vi.fn();
vi.mock("@/app/actions/sessions", () => ({ checkInToSession: (code: string) => checkIn(code) }));
vi.mock("@/app/actions/membership", () => ({ requestMembershipExit: async () => ({ success: false }) }));
vi.mock("@/app/actions/learn", () => ({ recordMaterialRead: async () => undefined }));
vi.mock("next/image", () => ({ default: (props: React.ComponentProps<"img">) => <img {...props} /> }));

const rules = parseRules(undefined);
const stats = { mergedPrs: 2, externalPrs: 0, commits: 3, newRepos: 1, newWorks: 0 };
const INDONESIAN = /\b(bulan|Kontribusi|Hadir|Tercapai|Belum|Alasan|Anda|Keluar|Buka|Sudah)\b/;

describe("English member portal pieces", () => {
  it("shows the contribution card in English with an English month", () => {
    const { container } = render(
      <ContributionCard division="builder" stats={stats} rules={rules} standing="warned" month="2026-12-01" locale="en" />,
    );
    expect(screen.getByText("This month's contribution")).toBeTruthy();
    expect(screen.getByText("December 2026")).toBeTruthy();
    expect(screen.getByText("Merged PRs")).toBeTruthy();
    expect(screen.getByRole("alert").textContent).toMatch(/did not meet last month's target/);
    expect(container.textContent).not.toMatch(INDONESIAN);
  });

  it("keeps the contribution card Indonesian by default", () => {
    render(<ContributionCard division="builder" stats={stats} rules={rules} standing="good" month="2026-12-01" />);
    expect(screen.getByText("Kontribusi bulan ini")).toBeTruthy();
    expect(screen.getByText("PR ter-merge")).toBeTruthy();
  });

  it("formats months and session times in the visitor's language", () => {
    expect(monthLabel("2026-12-01")).toBe("Desember 2026");
    expect(monthLabel("2026-12-01", "en")).toBe("December 2026");
    expect(formatWib("2026-12-04T12:30:00.000Z", "en")).toMatch(/Friday.*2026.*19\.30 WIB/);
  });

  it("checks in with English messages", async () => {
    checkIn.mockResolvedValueOnce({ success: true, title: "Sharing" });
    render(<CheckInForm locale="en" />);
    fireEvent.change(screen.getByLabelText("Check-in code"), { target: { value: "ABCD23" } });
    fireEvent.click(screen.getByRole("button", { name: "Check in" }));
    expect((await screen.findByRole("status")).textContent).toBe("Checked in: Sharing");

    checkIn.mockRejectedValueOnce(new Error("boom"));
    fireEvent.change(screen.getByLabelText("Check-in code"), { target: { value: "ABCD23" } });
    fireEvent.click(screen.getByRole("button", { name: "Check in" }));
    await waitFor(() => expect(screen.getByRole("alert").textContent).toBe("Check-in failed. Please try again."));
  });

  it("shows the leaving screens in English", () => {
    const { container, unmount } = render(<MembershipExitClient status="exited" exitedAt="2026-12-04T10:00:00.000Z" earliestExitAt={null} locale="en" />);
    expect(screen.getByText("Member History: Left")).toBeTruthy();
    expect(container.textContent).not.toMatch(INDONESIAN);
    unmount();
    render(<MembershipExitClient status="active" exitedAt={null} earliestExitAt="2999-01-01T00:00:00.000Z" locale="en" />);
    expect(screen.getByText("Reason for leaving (optional)")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Request to Leave" })).toBeTruthy();
    expect(screen.getByText(/You can request to leave from/)).toBeTruthy();
  });

  it("answers the exit policy in English and keeps Indonesian as the default", () => {
    const policy = { effective_at: "2026-01-01T00:00:00Z", minimum_active_days_before_exit: 30 } as never;
    const member = { registration_status: "approved", membership_status: "active", membership_started_at: new Date().toISOString(), hierarchy: "member", reapply_blocked: false } as never;
    const english = canRequestExit(member, new Date(), policy, "en");
    expect(english.allowed).toBe(false);
    expect(english.reason).toMatch(/^You can request to leave from/);
    expect(canRequestExit(member, new Date(), policy).reason).toMatch(/^Anda baru dapat mengajukan keluar/);
    expect(canRequestExit({ ...(member as object), membership_status: "exited" } as never, new Date(), policy, "en").reason).toBe("This membership has already ended.");
  });

  it("labels the learning feed in English", () => {
    const material = { id: "m1", title: "Prompt harness", description: "Isi materi", division: "builder", resource_url: "https://example.com", cover_url: null, created_at: "2026-12-04T10:00:00Z" } as never;
    const { unmount } = render(<LearnFeedClient initialMaterials={[material]} locale="en" />);
    expect(screen.getByRole("button", { name: /Open Material/ })).toBeTruthy();
    unmount();
    render(<LearnFeedClient initialMaterials={[]} locale="en" />);
    expect(screen.getByText("No learning materials have been published yet.")).toBeTruthy();
  });

  it("has an English line for every Indonesian one", () => {
    const keys = (value: unknown, prefix = ""): string[] =>
      typeof value === "object" && value !== null
        ? Object.entries(value).flatMap(([key, child]) => keys(child, `${prefix}${key}.`))
        : [prefix];
    expect(keys(PORTAL_COPY.en)).toEqual(keys(PORTAL_COPY.id));
  });
});
