import { describe, expect, it } from "vitest";
import { LOCALE_COOKIE, LOCALE_HEADER, localeFor } from "../src/lib/locale";

describe("localeFor", () => {
  it("is English only on the pages that really are English", () => {
    for (const path of ["/en", "/en/", "/en/join", "/en/join/", "/en/onboarding", "/en/terms", "/en/privacy", "/en/code-of-conduct", "/en/karya"]) expect(localeFor(path)).toBe("en");
  });

  it("stays Indonesian everywhere else, including look-alikes such as /english", () => {
    for (const path of ["/", "/members", "/projects", "/onboarding", "/english", "/members/en", "/dashboard", ""]) {
      expect(localeFor(path)).toBe("id");
    }
  });

  it("lets the language cookie choose English only inside the member portal", () => {
    for (const path of ["/dashboard", "/dashboard/learn", "/membership-exit"]) {
      expect(localeFor(path, "en")).toBe("en");
      expect(localeFor(path, "id")).toBe("id");
      expect(localeFor(path)).toBe("id");
      expect(localeFor(path, "constructor")).toBe("id");
    }
  });

  it("ignores the cookie on public pages, the admin area and look-alike paths", () => {
    for (const path of ["/", "/members", "/terms", "/projects", "/onboarding", "/admin/review", "/dashboardx", "/membership-exit-x"]) {
      expect(localeFor(path, "en")).toBe("id");
    }
  });

  it("keeps /en English whatever the cookie says", () => {
    expect(localeFor("/en/terms", "id")).toBe("en");
  });

  it("names the cookie", () => {
    expect(LOCALE_COOKIE).toBe("muara-lang");
  });

  it("names the header the middleware sets", () => {
    expect(LOCALE_HEADER).toBe("x-locale");
  });
});
