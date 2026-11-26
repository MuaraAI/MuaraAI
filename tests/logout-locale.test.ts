// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({ isSupabaseConfigured: () => false, createClient: async () => ({}) }));

import { GET } from "../src/app/api/auth/logout/route";

const go = async (cookie?: string) =>
  (await GET(new Request("https://muaraai.com/api/auth/logout", cookie ? { headers: { cookie } } : undefined))).headers.get("location");

describe("logout destination", () => {
  it("sends English portal members to the English site", async () => {
    expect(await go("muara-lang=en")).toBe("https://muaraai.com/en");
    expect(await go("a=b; muara-lang=en; c=d")).toBe("https://muaraai.com/en");
  });

  it("sends everyone else to the Indonesian home", async () => {
    for (const cookie of [undefined, "muara-lang=id", "muara-lang=english", "xmuara-lang=en", "muara-lang=constructor"]) {
      expect(await go(cookie)).toBe("https://muaraai.com/");
    }
  });
});
