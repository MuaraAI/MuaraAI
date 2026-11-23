import { describe, it, expect } from "vitest";
import { COOKIE_NAME, COOKIE_DOMAIN, SOCIABUZZ_URL } from "../src/lib/constants";

describe("Constants and Domain Config", () => {
  it("has correct cookie domain and donation url", () => {
    expect(COOKIE_NAME).toBe("sb-muaraai-auth-token");
    expect(COOKIE_DOMAIN).toBe(".muaraai.com");
    expect(SOCIABUZZ_URL).toBe("https://sociabuzz.com/muaraai");
  });
});
