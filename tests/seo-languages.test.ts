import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import sitemap from "../src/app/sitemap";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");

describe("language alternates", () => {
  it("lists both English pages in the sitemap", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toContain("https://muaraai.com/en");
    expect(urls).toContain("https://muaraai.com/en/join");
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("points the Indonesian landing and onboarding pages at their English counterparts", () => {
    const home = read("src/app/(public)/page.tsx");
    expect(home).toContain('en: "https://muaraai.com/en"');
    expect(home).toContain('id: "https://muaraai.com/"');
    const onboarding = read("src/app/(public)/onboarding/page.tsx");
    expect(onboarding).toContain('en: "https://muaraai.com/en/join"');
    expect(onboarding).toContain('id: "https://muaraai.com/onboarding"');
  });
});
