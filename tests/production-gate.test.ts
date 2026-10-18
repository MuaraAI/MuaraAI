import { describe, it, expect } from "vitest";
import { createClient } from "../src/lib/supabase/client";

const URL_KEY = "NEXT_PUBLIC_SUPABASE_URL";
const ANON_KEY = "NEXT_PUBLIC_SUPABASE_ANON_KEY";

function withPublicEnv(url: string | undefined, key: string | undefined, run: () => void) {
  const previousUrl = process.env[URL_KEY];
  const previousKey = process.env[ANON_KEY];
  if (url === undefined) delete process.env[URL_KEY];
  else process.env[URL_KEY] = url;
  if (key === undefined) delete process.env[ANON_KEY];
  else process.env[ANON_KEY] = key;
  try {
    run();
  } finally {
    if (previousUrl === undefined) delete process.env[URL_KEY];
    else process.env[URL_KEY] = previousUrl;
    if (previousKey === undefined) delete process.env[ANON_KEY];
    else process.env[ANON_KEY] = previousKey;
  }
}

describe("Production Delivery Gate", () => {
  it("fails fast when the public Supabase environment is not configured", () => {
    withPublicEnv(undefined, undefined, () => {
      expect(() => createClient()).toThrow("must be configured");
    });
    withPublicEnv("https://example.supabase.co", undefined, () => {
      expect(() => createClient()).toThrow("must be configured");
    });
  });

  it("builds the browser client once the public environment is configured", () => {
    withPublicEnv("https://example.supabase.co", "anon-key", () => {
      expect(createClient()).toBeTruthy();
    });
  });

  it("verifies package.json scripts and metadata", async () => {
    const pkg = await import("../package.json");
    expect(pkg.name).toBe("muaraai-web");
    expect(pkg.scripts.build).toBe("next build");
    expect(pkg.scripts.test).toBe("vitest run");
  });
});
