import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn();
const notifyMock = vi.fn();
let settings: Record<string, unknown> = {};
let signedIn = true;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: signedIn ? { id: "u1", email: "budi@example.com", user_metadata: { user_name: "budi" } } : null },
        error: null,
      }),
    },
    from: (table: string) => {
      if (table === "community_settings") {
        return {
          select: () => ({
            eq: (_column: string, key: string) => ({
              single: async () =>
                key in settings
                  ? { data: { value: settings[key] }, error: null }
                  : { data: null, error: { message: "not found" } },
            }),
          }),
        };
      }
      return {
        select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null }) }) }),
        upsert: upsertMock,
      };
    },
  }),
}));

vi.mock("@/lib/notify", () => ({ notifyMaintainers: (...args: unknown[]) => notifyMock(...args) }));

import { submitProofOfWork } from "../src/app/actions/pow";
import type { PoWInput } from "../src/lib/validation";

const input: PoWInput = {
  fullName: "  Budi Santoso ",
  affiliation: "umum",
  institution: " Universitas Contoh ",
  phoneWa: "081234567890",
  telegramUsername: "@budi_dev1",
  division: "builder",
  track: "Web",
  joinReason: `  ${"Saya ingin belajar dan membangun project bersama. ".repeat(8)}`,
  portfolioUrl: "https://github.com/budi/repo",
  toolchainNarrative: "Next.js, Supabase, dan Cursor.",
};

beforeEach(() => {
  upsertMock.mockReset().mockResolvedValue({ error: null });
  notifyMock.mockReset().mockResolvedValue({});
  signedIn = true;
  settings = {
    membership_intake: { policy_version: "global-open-v1", effective_at: "2020-01-01T00:00:00.000Z", minimum_active_days_before_exit: 30, block_reapply_after_exit: true },
    positions: { builder: ["Web", "Backend"], creative: ["Video"] },
  };
});

describe("submitProofOfWork in English", () => {
  it("answers in English when asked", async () => {
    expect(await submitProofOfWork({ ...input, track: "Game" }, "en")).toEqual({ success: false, error: "Invalid position for the chosen division." });
    delete settings.positions;
    expect(await submitProofOfWork(input, "en")).toEqual({ success: false, error: "The position list has not been configured." });
    settings.positions = { builder: ["Web"], creative: ["Video"] };
    delete settings.membership_intake;
    expect(await submitProofOfWork(input, "en")).toEqual({ success: false, error: "Registration is currently unavailable." });
    signedIn = false;
    expect(await submitProofOfWork(input, "en")).toEqual({ success: false, error: "No session found. Please sign in with GitHub again." });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("falls back to Indonesian for a language the client invents", async () => {
    for (const locale of ["fr", undefined, 7, { en: true }]) {
      expect(await submitProofOfWork({ ...input, track: "Game" }, locale as never)).toEqual({ success: false, error: "Posisi tidak valid untuk divisi yang dipilih." });
    }
  });

  it("saves the application the same way whatever the language", async () => {
    expect(await submitProofOfWork(input, "en")).toEqual({ success: true });
    expect(upsertMock).toHaveBeenCalledTimes(1);
    expect(upsertMock.mock.calls[0][0]).toMatchObject({ id: "u1", full_name: "Budi Santoso", registration_status: "pending" });
  });

  it("keeps maintainer alerts in Indonesian", async () => {
    await submitProofOfWork(input, "en");
    expect(notifyMock.mock.calls[0][0]).toBe("Pendaftar baru");
  });
});
