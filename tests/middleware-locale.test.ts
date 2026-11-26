// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../src/middleware";

const saved = { url: process.env.NEXT_PUBLIC_SUPABASE_URL, key: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY };

beforeEach(() => {
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
});
afterEach(() => {
  if (saved.url) process.env.NEXT_PUBLIC_SUPABASE_URL = saved.url;
  if (saved.key) process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = saved.key;
});

// NextResponse.next({ request: { headers } }) is encoded as x-middleware-request-<name> response headers.
const forwarded = async (path: string, cookie?: string) =>
  (await middleware(new NextRequest(`https://muaraai.com${path}`, cookie ? { headers: { cookie: `muara-lang=${cookie}` } } : undefined))).headers.get("x-middleware-request-x-locale");

describe("middleware locale header", () => {
  it("forwards en on the English pages and id elsewhere", async () => {
    expect(await forwarded("/en")).toBe("en");
    expect(await forwarded("/en/join")).toBe("en");
    expect(await forwarded("/")).toBe("id");
    expect(await forwarded("/projects")).toBe("id");
    expect(await forwarded("/en/unknown")).toBe("en");
    expect(await forwarded("/english")).toBe("id");
  });

  it("reads the language cookie in the member portal only", async () => {
    expect(await forwarded("/dashboard", "en")).toBe("en");
    expect(await forwarded("/membership-exit", "en")).toBe("en");
    expect(await forwarded("/dashboard")).toBe("id");
    expect(await forwarded("/members", "en")).toBe("id");
    expect(await forwarded("/admin/review", "en")).toBe("id");
  });

  it("does not let a visitor force the language with their own header", async () => {
    const request = new NextRequest("https://muaraai.com/members", { headers: { "x-locale": "en" } });
    expect((await middleware(request)).headers.get("x-middleware-request-x-locale")).toBe("id");
  });
});
