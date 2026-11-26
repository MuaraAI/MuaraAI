import { describe, expect, it } from "vitest";
import { LOCALE_HEADER, localeFor } from "../src/lib/locale";

describe("localeFor", () => {
  it("is English only on the pages that really are English", () => {
    for (const path of ["/en", "/en/", "/en/join", "/en/join/", "/en/onboarding", "/en/terms", "/en/privacy", "/en/code-of-conduct"]) expect(localeFor(path)).toBe("en");
  });

  it("stays Indonesian everywhere else, including look-alikes such as /english", () => {
    for (const path of ["/", "/members", "/projects", "/onboarding", "/english", "/members/en", "/dashboard", ""]) {
      expect(localeFor(path)).toBe("id");
    }
  });

  it("names the header the middleware sets", () => {
    expect(LOCALE_HEADER).toBe("x-locale");
  });
});
