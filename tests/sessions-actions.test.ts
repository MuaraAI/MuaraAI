import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

interface Call {
  table: string;
  op: string;
  args: unknown[];
}

const calls: Call[] = [];
const queues: Record<string, unknown[]> = {};
let maintainer = true;
let user: { id: string } | null = { id: "u1" };

const next = (key: string, fallback: unknown) => (queues[key]?.length ? queues[key].shift() : fallback);
const queue = (key: string, ...results: unknown[]) => void (queues[key] = [...results]);
const opsOf = (table: string, op: string) => calls.filter((call) => call.table === table && call.op === op);

function fakeClient() {
  return {
    from: (table: string) => {
      const builder: Record<string, unknown> = {};
      let last = "";
      const record = (op: string) => (...args: unknown[]) => {
        calls.push({ table, op, args });
        last = op;
        return builder;
      };
      for (const op of ["select", "insert", "update", "delete", "upsert", "eq"]) builder[op] = record(op);
      builder.single = async () => next(`${table}.single`, { data: null, error: null });
      builder.maybeSingle = async () => next(`${table}.maybeSingle`, { data: null, error: null });
      builder.then = (resolve: (value: unknown) => unknown) => resolve(next(`${table}.${last}`, { error: null }));
      return builder;
    },
  };
}

let requestLocale: "id" | "en" = "id";
vi.mock("@/lib/locale-server", () => ({ currentLocale: async () => requestLocale }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser: async () => ({ data: { user } }) } }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  getMaintainerClient: async () => (maintainer ? fakeClient() : null),
  createPrivilegedClient: async () => fakeClient(),
}));

import {
  checkInToSession,
  createSession,
  deleteSession,
  regenerateCheckinCode,
  updateSession,
} from "../src/app/actions/sessions";

const input = {
  title: "Sharing PR pertama",
  type: "sharing",
  materi: "Cara membuka PR",
  startsAt: "2026-12-04T12:30:00.000Z",
  endsAt: "2026-12-04T15:00:00.000Z",
  discordUrl: "https://discord.gg/muaraai",
};
const GENERIC = "Terjadi kesalahan pada server. Silakan coba lagi.";
const CHECKIN_ERROR = "Kode tidak valid, atau sesi belum dibuka / sudah selesai.";
const CODE = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6}$/;

beforeEach(() => {
  calls.length = 0;
  for (const key of Object.keys(queues)) delete queues[key];
  maintainer = true;
  user = { id: "u1" };
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("admin session actions", () => {
  it("rejects non-maintainers without touching the database", async () => {
    maintainer = false;
    for (const result of [
      await createSession(input),
      await updateSession("s1", input),
      await deleteSession("s1"),
      await regenerateCheckinCode("s1"),
    ]) {
      expect(result.success).toBe(false);
    }
    expect(calls).toEqual([]);
  });

  it("creates a session with a fresh 6-character code and returns it", async () => {
    queue("discord_sessions.single", { data: { id: "s1" }, error: null });
    const result = await createSession(input);

    expect(result).toMatchObject({ success: true, id: "s1" });
    const row = opsOf("discord_sessions", "insert")[0].args[0] as Record<string, unknown>;
    expect(row.checkin_code).toMatch(CODE);
    expect((result as { code: string }).code).toBe(row.checkin_code);
    expect(row).toMatchObject({ title: "Sharing PR pertama", type: "sharing", discord_url: "https://discord.gg/muaraai" });
  });

  it("rejects invalid input without a query", async () => {
    const result = await createSession({ ...input, discordUrl: "http://evil.example" });
    expect(result.success).toBe(false);
    expect(calls).toEqual([]);
  });

  it("retries a colliding code up to three times, then gives a generic error", async () => {
    const collision = { data: null, error: { code: "23505", message: "duplicate key" } };
    queue("discord_sessions.single", collision, collision, { data: { id: "s2" }, error: null });
    expect(await createSession(input)).toMatchObject({ success: true, id: "s2" });
    expect(opsOf("discord_sessions", "insert")).toHaveLength(3);

    calls.length = 0;
    queue("discord_sessions.single", collision, collision, collision);
    expect(await createSession(input)).toEqual({ success: false, error: GENERIC });
    expect(opsOf("discord_sessions", "insert")).toHaveLength(3);
  });

  it("never leaks database errors", async () => {
    queue("discord_sessions.single", { data: null, error: { code: "XX000", message: "secret table detail" } });
    const result = await createSession(input);
    expect(result).toEqual({ success: false, error: GENERIC });
  });

  it("updates a session without touching the check-in code", async () => {
    expect(await updateSession("s1", input)).toEqual({ success: true });
    const payload = opsOf("discord_sessions", "update")[0].args[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("checkin_code");
    expect(payload).toMatchObject({ title: "Sharing PR pertama", starts_at: "2026-12-04T12:30:00.000Z" });
    expect(opsOf("discord_sessions", "eq")[0].args).toEqual(["id", "s1"]);
  });

  it("deletes a session by id", async () => {
    expect(await deleteSession("s1")).toEqual({ success: true });
    expect(opsOf("discord_sessions", "delete")).toHaveLength(1);
    expect(opsOf("discord_sessions", "eq")[0].args).toEqual(["id", "s1"]);
  });

  it("regenerates only the code, retrying on a collision", async () => {
    queue("discord_sessions.eq", { error: { code: "23505", message: "duplicate" } }, { error: null });
    const result = await regenerateCheckinCode("s1");
    expect(result).toMatchObject({ success: true });
    const updates = opsOf("discord_sessions", "update");
    expect(updates).toHaveLength(2);
    expect(Object.keys(updates[1].args[0] as object)).toEqual(["checkin_code"]);
    expect((result as { code: string }).code).toBe((updates[1].args[0] as { checkin_code: string }).checkin_code);
  });
});

describe("checkInToSession", () => {
  const session = { id: "s1", title: "Sharing PR pertama", starts_at: "2026-12-04T12:30:00.000Z", ends_at: "2026-12-04T15:00:00.000Z" };
  const activeMember = { registration_status: "approved", membership_status: "active", is_active: true };
  const at = (iso: string) => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(iso));
  };

  const prepare = (member: unknown = activeMember, found: unknown = session) => {
    queue("members.maybeSingle", { data: member, error: null });
    queue("discord_sessions.maybeSingle", { data: found, error: null });
  };

  it("refuses codes that cannot be valid without any query", async () => {
    for (const bad of [null, 123, "", "ABC", "ABCDEFG", "ABCDE0"]) {
      expect(await checkInToSession(bad)).toEqual({ success: false, error: CHECKIN_ERROR });
    }
    expect(calls).toEqual([]);
  });

  it("answers in English when the portal is in English", async () => {
    requestLocale = "en";
    try {
      expect(await checkInToSession("ABC")).toEqual({ success: false, error: "The code is not valid, or the session has not opened yet or has already ended." });
      user = null;
      expect(await checkInToSession("ABCD23")).toEqual({ success: false, error: "Please sign in first." });
    } finally {
      requestLocale = "id";
    }
  });

  it("asks anonymous visitors to sign in", async () => {
    user = null;
    expect(await checkInToSession("ABCD23")).toEqual({ success: false, error: "Silakan masuk dulu." });
    expect(calls).toEqual([]);
  });

  it("only lets approved, active members check in", async () => {
    at("2026-12-04T13:00:00Z");
    for (const member of [
      { ...activeMember, registration_status: "pending" },
      { ...activeMember, registration_status: "rejected" },
      { ...activeMember, membership_status: "exited" },
      { ...activeMember, is_active: false },
      null,
    ]) {
      calls.length = 0;
      prepare(member);
      expect(await checkInToSession("ABCD23")).toEqual({ success: false, error: "Hanya anggota aktif yang bisa check-in." });
      expect(opsOf("session_attendance", "upsert")).toEqual([]);
    }
  });

  it("answers an unknown code, an early check-in and a late check-in identically", async () => {
    prepare(activeMember, null);
    at("2026-12-04T13:00:00Z");
    const unknown = await checkInToSession("ABCD23");

    prepare();
    at("2026-12-04T12:14:00Z");
    const early = await checkInToSession("ABCD23");

    prepare();
    at("2026-12-04T15:01:00Z");
    const late = await checkInToSession("ABCD23");

    expect(unknown).toEqual({ success: false, error: CHECKIN_ERROR });
    expect(early).toEqual(unknown);
    expect(late).toEqual(unknown);
    expect(opsOf("session_attendance", "upsert")).toEqual([]);
  });

  it("records attendance inside the window for the signed-in member, normalizing the code", async () => {
    at("2026-12-04T12:15:00Z");
    prepare();
    const result = await checkInToSession("abc d23");

    expect(result).toEqual({ success: true, title: "Sharing PR pertama" });
    expect(opsOf("discord_sessions", "eq")[0].args).toEqual(["checkin_code", "ABCD23"]);
    const upsert = opsOf("session_attendance", "upsert")[0];
    expect(upsert.args[0]).toEqual({ session_id: "s1", member_id: "u1" });
    expect(upsert.args[1]).toEqual({ onConflict: "session_id,member_id", ignoreDuplicates: true });
  });

  it("is idempotent: checking in twice succeeds both times", async () => {
    at("2026-12-04T14:00:00Z");
    prepare();
    expect((await checkInToSession("ABCD23")).success).toBe(true);
    prepare();
    expect((await checkInToSession("ABCD23")).success).toBe(true);
  });

  it("gives a generic error when saving the attendance fails", async () => {
    at("2026-12-04T14:00:00Z");
    prepare();
    queue("session_attendance.upsert", { error: { code: "XX000", message: "secret" } });
    expect(await checkInToSession("ABCD23")).toEqual({ success: false, error: GENERIC });
  });
});
