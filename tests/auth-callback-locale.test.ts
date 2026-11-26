// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

let member: unknown = null;
let exchangeError: unknown = null;

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: {
      exchangeCodeForSession: async () => ({ error: exchangeError }),
      getUser: async () => ({ data: { user: { id: "u1" } } }),
    },
    from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: member }) }) }) }),
  }),
}));

import { GET } from "../src/app/api/auth/callback/route";

const go = async (query: string) => (await GET(new Request(`https://muaraai.com/api/auth/callback?${query}`))).headers.get("location");

beforeEach(() => {
  member = null;
  exchangeError = null;
});

const cookieOf = async (query: string) => (await GET(new Request(`https://muaraai.com/api/auth/callback?${query}`))).cookies.get("muara-lang")?.value;

describe("auth callback language cookie", () => {
  it("remembers English for the portal when sign-in started from the English join page", async () => {
    expect(await cookieOf("code=x&next=/en/onboarding")).toBe("en");
    member = { id: "u1", registration_status: "pending" };
    expect(await cookieOf("code=x&next=/en/onboarding")).toBe("en");
  });

  it("does not set it for anything else, so it cannot be forced", async () => {
    for (const q of ["code=x", "code=x&next=/members", "code=x&next=/en/onboarding/../x", "code=x&next=%2Fen%2Fjoin"]) {
      expect(await cookieOf(q)).toBeUndefined();
    }
  });
});

describe("auth callback language", () => {
  it("sends a new GitHub account to the English form only when it asked for it", async () => {
    expect(await go("code=x&next=/en/onboarding")).toBe("https://muaraai.com/en/onboarding");
    expect(await go("code=x")).toBe("https://muaraai.com/onboarding");
  });

  it("ignores any other next value for a new account (no open redirects)", async () => {
    for (const next of ["https://evil.com", "//evil.com", "/admin/review", "/en/onboarding/../x"]) {
      expect(await go(`code=x&next=${encodeURIComponent(next)}`)).toBe("https://muaraai.com/onboarding");
    }
  });

  it("keeps existing members going to their dashboard or a local next", async () => {
    member = { id: "u1", registration_status: "approved" };
    expect(await go("code=x")).toBe("https://muaraai.com/dashboard");
    expect(await go("code=x&next=/members")).toBe("https://muaraai.com/members");
    expect(await go("code=x&next=//evil.com")).toBe("https://muaraai.com/dashboard");
  });

  it("returns failures to the form in the same language", async () => {
    exchangeError = { message: "bad" };
    expect(await go("code=x&next=/en/onboarding")).toBe("https://muaraai.com/en/onboarding?error=oauth_callback_failed");
    expect(await go("code=x")).toBe("https://muaraai.com/onboarding?error=oauth_callback_failed");
  });
});
