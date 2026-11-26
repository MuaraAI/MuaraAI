import { describe, expect, it } from "vitest";
import { LOCALE_HEADER, localeFor } from "../src/lib/locale";

describe("localeFor", () => {
  it("is English only on the pages that really are English", () => {
    for (const path of ["/en", "/en/", "/en/join", "/en/join/"]) expect(localeFor(path)).toBe("en");
  });

  it("stays Indonesian everywhere else, including unknown /en paths that show the Indonesian 404", () => {
    for (const path of ["/", "/members", "/projects", "/onboarding", "/english", "/en/unknown", "/en/join/extra", "/members/en", "/dashboard", ""]) {
      expect(localeFor(path)).toBe("id");
    }
  });

  it("names the header the middleware sets", () => {
    expect(LOCALE_HEADER).toBe("x-locale");
  });
});
