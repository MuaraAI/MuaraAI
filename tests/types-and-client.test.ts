import { describe, it, expect } from "vitest";
import { COOKIE_NAME, COOKIE_DOMAIN, DUES_WEEKLY_FEE, DUES_MONTHLY_FEE } from "../src/lib/constants";

describe("Constants and Domain Config", () => {
  it("has correct cookie domain and dues pricing", () => {
    expect(COOKIE_NAME).toBe("sb-muaraai-auth-token");
    expect(COOKIE_DOMAIN).toBe(".muaraai.com");
    expect(DUES_WEEKLY_FEE).toBe(3000);
    expect(DUES_MONTHLY_FEE).toBe(12000);
  });
});
