import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "node:fs";
import path from "node:path";
import React from "react";

interface Call {
  table: string;
  op: string;
  args: unknown[];
}

const calls: Call[] = [];
let sessions: unknown[] = [];
let attendance: unknown[] = [];

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    from: (table: string) => {
      const builder: Record<string, unknown> = {};
      for (const op of ["select", "order", "limit", "eq"]) {
        builder[op] = (...args: unknown[]) => {
          calls.push({ table, op, args });
          return builder;
        };
      }
      builder.then = (resolve: (value: unknown) => unknown) =>
        resolve({ data: table === "discord_sessions" ? sessions : attendance, error: null });
      return builder;
    },
  }),
}));
vi.mock("@/app/actions/sessions", () => ({ checkInToSession: vi.fn() }));

import SessionsSection from "../src/components/portal/sessions-section";

const session = (id: string, day: string, over: Record<string, unknown> = {}) => ({
  id,
  title: `Sesi ${id}`,
  type: "sharing",
  materi: `Materi ${id}`,
  starts_at: `${day}T12:30:00.000Z`,
  ends_at: `${day}T15:00:00.000Z`,
  discord_url: "https://discord.gg/muaraai",
  ...over,
});

const render_ = async () => render(await SessionsSection({ memberId: "u1" }));

beforeEach(() => {
  calls.length = 0;
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(new Date("2026-12-04T13:00:00Z")); // inside the 12:30-15:00 session
  sessions = [session("s2", "2026-12-04"), session("s1", "2026-11-27"), session("s0", "2026-11-20")];
  attendance = [{ session_id: "s1" }];
});

afterEach(() => vi.useRealTimers());

describe("SessionsSection", () => {
  it("shows the next session with its WIB schedule, material and Discord link", async () => {
    await render_();
    expect(screen.getByText("Sesi s2")).toBeTruthy();
    expect(screen.getByText(/Sharing/)).toBeTruthy();
    expect(screen.getByText(/19\.30 WIB/)).toBeTruthy();
    expect(screen.getByText("Materi s2")).toBeTruthy();
    const link = screen.getByRole("link", { name: /Buka Discord/i });
    expect(link.getAttribute("href")).toBe("https://discord.gg/muaraai");
    expect(link.getAttribute("rel")).toContain("noopener");
  });

  it("shows the check-in form only while the session is open", async () => {
    const { unmount } = await render_();
    expect(screen.getByLabelText(/Kode check-in/i)).toBeTruthy();
    unmount();

    vi.setSystemTime(new Date("2026-12-04T12:00:00Z")); // 30 minutes before the start
    await render_();
    expect(screen.queryByLabelText(/Kode check-in/i)).toBeNull();
  });

  it("explains when no session is scheduled", async () => {
    sessions = [session("s1", "2026-11-27")];
    await render_();
    expect(screen.getByText("Belum ada sesi dijadwalkan.")).toBeTruthy();
  });

  it("shows the member's own attendance and streak from ended sessions", async () => {
    await render_();
    expect(screen.getByText(/Hadir 1 dari 2 sesi terakhir/)).toBeTruthy();
    expect(screen.getByText(/Streak kehadiran: 1 sesi/)).toBeTruthy();
  });

  it("hides the attendance summary until a session has ended", async () => {
    sessions = [session("s2", "2026-12-04")];
    attendance = [];
    await render_();
    expect(screen.queryByText(/Hadir \d+ dari/)).toBeNull();
  });

  it("reads only the member's own attendance and never asks for the check-in code", async () => {
    await render_();
    const selects = calls.filter((call) => call.op === "select").map((call) => String(call.args[0]));
    expect(selects.some((columns) => columns.includes("checkin_code"))).toBe(false);
    expect(calls.some((call) => call.table === "session_attendance" && call.op === "eq" && call.args[0] === "member_id" && call.args[1] === "u1")).toBe(true);
  });

  it("never touches the privileged client or the code column in source", () => {
    for (const file of ["src/components/portal/sessions-section.tsx", "src/components/portal/check-in-form.tsx"]) {
      const source = fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");
      expect(source).not.toContain("checkin_code");
      expect(source).not.toContain("@/lib/supabase/admin");
    }
  });
});
