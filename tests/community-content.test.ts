import { describe, expect, it } from "vitest";
import { communityContent } from "../src/lib/community-content";

describe("national community content", () => {
  it("contains official links without Telegram", () => {
    expect(communityContent.officialLinks.website).toBe("https://muaraai.com/");
    expect(communityContent.officialLinks.apiPortal).toBe("https://ai.muaraai.com/");
    expect(communityContent.officialLinks.x).toBe("https://x.com/MuaraAI");
    expect(communityContent.officialLinks.instagram).toBe("https://www.instagram.com/muara.ai/");
    expect(communityContent.officialLinks.threads).toBe("https://www.threads.com/@muara.ai");
    expect(Object.values(communityContent.officialLinks)).not.toContain("https://t.me/muaraai");
  });

  it("lists the products that exist in the org, each with a live site and a GitHub repo", () => {
    const { products } = communityContent;
    expect(products.map((product) => product.name)).toEqual(["Mira", "FluxCode", "Muara V1 Flash", "Laku"]);
    expect(products.map((product) => product.url)).toEqual([
      "https://mira.muaraai.com",
      "https://fluxcode.muaraai.com",
      "https://ai.muaraai.com",
      "https://laku.muaraai.com",
    ]);
    for (const product of products) {
      expect(product.repo).toMatch(/^https:\/\/github\.com\/MuaraAI\//);
      expect(product.id.length).toBeGreaterThan(20);
      expect(product.en.length).toBeGreaterThan(20);
      expect(`${product.id}${product.en}`).not.toContain("\u2014");
    }
    expect(Object.values(communityContent.officialLinks)).not.toContain("https://ollama.com/MuaraAI");
  });

  it("keeps corrected maintainer identity and order", () => {
    expect(communityContent.coreMaintainers.map((member) => member.github)).toEqual([
      "Curzyori",
      "Seeyaa77",
      "MyKineID",
    ]);
    expect(communityContent.coreMaintainers[1]).toMatchObject({
      name: "Muhammad Raffli Aldiansyah",
      division: "Builder",
    });
    expect(communityContent.coreMaintainers[2]).toMatchObject({
      name: "Verzio Yamanansyah",
      division: "Builder",
    });
    for (const maintainer of communityContent.coreMaintainers) {
      expect(maintainer).not.toHaveProperty("nim");
    }
  });

});
