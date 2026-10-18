import { describe, expect, it } from "vitest";
import { communityContent } from "../src/lib/community-content";

describe("national community content", () => {
  it("contains official links without Telegram", () => {
    expect(communityContent.officialLinks.website).toBe("https://muaraai.com/");
    expect(communityContent.officialLinks.playground).toBe("https://ai.muaraai.com/");
    expect(communityContent.officialLinks.x).toBe("https://x.com/MuaraAI");
    expect(communityContent.officialLinks.instagram).toBe("https://www.instagram.com/muara.ai/");
    expect(communityContent.officialLinks.threads).toBe("https://www.threads.com/@muara.ai");
    expect(Object.values(communityContent.officialLinks)).not.toContain("https://t.me/muaraai");
  });

  it("pins the current Muara Arus 1 scope", () => {
    expect(communityContent.muaraArusOne.modelId).toBe("muara-arus-1");
    expect(communityContent.muaraArusOne.parameters).toBe("1.5B");
    expect(communityContent.muaraArusOne.offline).toBe(true);
    expect(communityContent.muaraArusOne.programs).toEqual(["SI", "SIA", "IF"]);
  });

  it("keeps corrected maintainer identity and order", () => {
    expect(communityContent.coreMaintainers.map((member) => member.github)).toEqual([
      "Curzyori",
      "Seeyaa77",
      "MyKineID",
    ]);
    expect(communityContent.coreMaintainers[1]).toMatchObject({
      name: "Muhammad Raffli Aldiansyah",
      nim: "15260161",
      division: "Builder",
    });
    expect(communityContent.coreMaintainers[2]).toMatchObject({
      name: "Verzio Yamanansyah",
      nim: "15260225",
      division: "Builder",
    });
  });

  it("marks Pontianak as founding hub and Jakarta as regional hub", () => {
    expect(communityContent.campusNodes.find((node) => node.city === "Pontianak")).toMatchObject({
      role: "founding-hub",
      offlineGathering: true,
    });
    expect(communityContent.campusNodes.find((node) => node.city === "Jakarta")).toMatchObject({
      role: "regional-hub",
    });
  });
});
