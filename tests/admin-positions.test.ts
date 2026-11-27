import { beforeEach, describe, expect, it, vi } from "vitest";

const upsertMock = vi.fn();
let hierarchy = "maintainer";

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: { id: "u1" } } }) },
    from: (table: string) =>
      table === "members"
        ? {
            select: () => ({
              eq: () => ({ single: async () => ({ data: { id: "u1", hierarchy, roles: [] } }) }),
            }),
          }
        : { upsert: upsertMock },
  }),
}));

import { updatePositions } from "../src/app/actions/admin";

beforeEach(() => {
  hierarchy = "maintainer";
  upsertMock.mockReset().mockResolvedValue({ error: null });
});

describe("updatePositions", () => {
  it("normalizes input and upserts the positions setting", async () => {
    const result = await updatePositions({ builder: [" Web ", "web", "Backend", ""], creative: ["Video"] });
    expect(result).toEqual({ success: true });
    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        key: "positions",
        value: { builder: ["Web", "Backend"], creative: ["Video"], cybersecurity: [] },
      }),
      { onConflict: "key" }
    );
  });

  it("rejects non-maintainers", async () => {
    hierarchy = "member";
    await expect(updatePositions({ builder: ["Web"], creative: ["Video"] })).rejects.toThrow("Forbidden");
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("rejects a division with no positions", async () => {
    const result = await updatePositions({ builder: ["Web"], creative: ["  ", ""] });
    expect(result).toEqual({ success: false, error: "Setiap divisi harus punya minimal satu posisi." });
    expect(upsertMock).not.toHaveBeenCalled();
  });

  it("hides raw database errors from the client", async () => {
    upsertMock.mockResolvedValue({ error: { message: "relation x does not exist" } });
    const result = await updatePositions({ builder: ["Web"], creative: ["Video"] });
    expect(result).toEqual({ success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." });
  });
});
