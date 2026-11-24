import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn();
const notifyMock = vi.fn();
let settings: Record<string, unknown> = {};

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      getUser: async () => ({
        data: { user: { id: "u1", email: "budi@example.com", user_metadata: { user_name: "budi" } } },
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
  settings = {
    membership_intake: {
      policy_version: "global-open-v1",
      effective_at: "2020-01-01T00:00:00.000Z",
      minimum_active_days_before_exit: 30,
      block_reapply_after_exit: true,
    },
    positions: { builder: ["Web", "Backend"], creative: ["Video"] },
  };
});

describe("submitProofOfWork (open intake)", () => {
  it("refuses when the positions setting is missing", async () => {
    delete settings.positions;
    const result = await submitProofOfWork(input);
    expect(result).toEqual({ success: false, error: "Daftar posisi belum dikonfigurasi." });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rejects a position outside the configured list even if the client was bypassed", async () => {
    const result = await submitProofOfWork({ ...input, track: "Game" });
    expect(result).toEqual({ success: false, error: "Posisi tidak valid untuk divisi yang dipilih." });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("stores the new profile fields and none of the legacy student fields", async () => {
    const result = await submitProofOfWork({ ...input, secondaryDivision: "creative", secondaryTrack: "Video" });
    expect(result).toEqual({ success: true });
    const row = upsertMock.mock.calls[0][0];
    expect(row).toMatchObject({
      id: "u1",
      full_name: "Budi Santoso",
      campus: "Universitas Contoh",
      affiliation: "umum",
      phone_wa: "081234567890",
      telegram_username: "budi_dev1",
      division: "builder",
      track: "Web",
      secondary_division: "creative",
      secondary_track: "Video",
      sub_hierarchy: "member-builder",
      registration_status: "pending",
      github_username: "budi",
    });
    expect(row.join_reason).toBe(input.joinReason.trim());
    expect(row).not.toHaveProperty("nim");
    expect(row).not.toHaveProperty("prodi");
    expect(row).not.toHaveProperty("kelas");
  });

  it("falls back to a neutral institution and nulls empty optional fields", async () => {
    await submitProofOfWork({ ...input, institution: "  ", telegramUsername: "" });
    const row = upsertMock.mock.calls[0][0];
    expect(row.campus).toBe("Tidak disebutkan");
    expect(row.telegram_username).toBeNull();
    expect(row.secondary_division).toBeNull();
    expect(row.secondary_track).toBeNull();
  });

  it("stores an empty secondaryDivision as null instead of an empty string", async () => {
    await submitProofOfWork({ ...input, secondaryDivision: "" as never });
    expect(upsertMock.mock.calls[0][0].secondary_division).toBeNull();
    expect(upsertMock.mock.calls[0][0].secondary_track).toBeNull();
  });

  it("hides raw database errors from the client", async () => {
    upsertMock.mockResolvedValue({ error: { message: "violates check constraint members_join_reason_length_check" } });
    const result = await submitProofOfWork(input);
    expect(result).toEqual({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
  });

  it("alerts maintainers without student-only wording and truncates the reason", async () => {
    await submitProofOfWork(input);
    const [title, text] = notifyMock.mock.calls[0] as [string, string];
    expect(title).toBe("Pendaftar baru");
    expect(text).not.toMatch(/Mahasiswa|NIM/);
    expect(text).toContain("Web");
    expect(text).toContain("umum");
    const reasonLine = text.split("\n").find((line) => line.startsWith("Alasan: ")) ?? "";
    expect(reasonLine.length).toBeLessThanOrEqual("Alasan: ".length + 303);
  });
});
