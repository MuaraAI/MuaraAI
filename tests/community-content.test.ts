import { describe, expect, it } from "vitest";
import { communityContent } from "../src/lib/community-content";

describe("national community content", () => {
  it("contains official links without Telegram", () => {
    expect(communityContent.officialLinks.website).toBe("https://muaraai.com/");
    expect(communityContent.officialLinks).not.toHaveProperty("apiPortal");
    expect(communityContent.officialLinks.x).toBe("https://x.com/MuaraAI");
    expect(communityContent.officialLinks.instagram).toBe("https://www.instagram.com/muara.ai/");
    expect(communityContent.officialLinks.threads).toBe("https://www.threads.com/@muara.ai");
    expect(Object.values(communityContent.officialLinks)).not.toContain("https://t.me/muaraai");
  });

  it("features only Mira and FluxCode, each with a live site and a GitHub repo", () => {
    const { products } = communityContent;
    expect(products.map((product) => product.name)).toEqual(["Mira", "FluxCode"]);
    expect(products.map((product) => product.url)).toEqual(["https://mira.muaraai.com", "https://fluxcode.muaraai.com"]);
    for (const product of products) {
      expect(product.repo).toMatch(/^https:\/\/github\.com\/MuaraAI\//);
      expect(product.id.length).toBeGreaterThan(20);
      expect(product.en.length).toBeGreaterThan(20);
      expect(`${product.id}${product.en}`).not.toContain("\u2014");
    }
    expect(Object.values(communityContent.officialLinks)).not.toContain("https://ollama.com/MuaraAI");
  });

  it("marks the AI portal as coming soon without any link", () => {
    expect(communityContent.comingSoon.map((item) => item.name)).toEqual(["Muara V1 Flash"]);
    for (const item of communityContent.comingSoon) expect(item).not.toHaveProperty("url");
  });

  it("no longer carries a hand-written maintainer list (the team comes from the members table)", () => {
    expect(communityContent).not.toHaveProperty("coreMaintainers");
  });

});
