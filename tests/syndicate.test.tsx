import { describe, it, expect } from "vitest";
import { filterMembers } from "../src/components/landing/syndicate-roster";
import { Member } from "../src/types/database";

describe("Syndicate Roster Filtering", () => {
  const mockMembers: Partial<Member>[] = [
    { id: "1", full_name: "Yuken", hierarchy: "maintainer", division: "builder", tier: 3, streak: 2 },
    { id: "2", full_name: "Greeezzz", hierarchy: "member", division: "creative", tier: 0, streak: 0 },
    { id: "3", full_name: "Raffli", hierarchy: "maintainer", division: "builder", tier: 3, streak: 5 },
  ];

  it("ranks by tier, then streak, then name when filter is 'top-tier'", () => {
    const members = [
      ...mockMembers,
      { id: "4", full_name: "Anya", hierarchy: "member", division: "creative", tier: 3, streak: 5 },
      { id: "5", full_name: "Zed", hierarchy: "member", division: "builder", tier: 4, streak: 1 },
    ];
    const result = filterMembers(members as Member[], "top-tier");
    expect(result.map((m) => m.full_name)).toEqual(["Zed", "Anya", "Raffli", "Yuken"]);
  });

  it("leaves members without a tier out of 'top-tier' and survives an empty result", () => {
    expect(filterMembers(mockMembers as Member[], "top-tier").some((m) => m.full_name === "Greeezzz")).toBe(false);
    expect(filterMembers([{ id: "9", full_name: "Nol", tier: 0 }] as Member[], "top-tier")).toEqual([]);
    expect(filterMembers([{ id: "9", full_name: "Tanpa" }] as Member[], "top-tier")).toEqual([]);
  });

  it("filters correctly by division", () => {
    const creative = filterMembers(mockMembers as Member[], "creative");
    expect(creative.length).toBe(1);
    expect(creative[0].full_name).toBe("Greeezzz");
  });

  it("filters correctly by maintainer", () => {
    const maintainers = filterMembers(mockMembers as Member[], "maintainer");
    expect(maintainers.length).toBe(2);
  });

  it("filters correctly by lead and head roles", () => {
    const testMembers: Partial<Member>[] = [
      { id: "1", full_name: "Lead Dev", hierarchy: "lead", division: "builder" },
      { id: "2", full_name: "Head Builder", hierarchy: "head", division: "builder" },
      { id: "3", full_name: "Member", hierarchy: "member", division: "creative" },
    ];
    const leads = filterMembers(testMembers as Member[], "lead");
    expect(leads.length).toBe(1);
    expect(leads[0].full_name).toBe("Lead Dev");

    const heads = filterMembers(testMembers as Member[], "head");
    expect(heads.length).toBe(1);
    expect(heads[0].full_name).toBe("Head Builder");
  });

  it("deduplicates role_title and titles when they overlap", () => {
    const member: Partial<Member> = {
      role_title: "Founder",
      titles: ["Founder", "Maintainer", "Head of Builder"],
    };
    const uniqueTitles = Array.from(
      new Set(
        [member.role_title, ...(member.titles || [])].filter((t): t is string =>
          Boolean(t && t.trim())
        )
      )
    );
    expect(uniqueTitles).toEqual(["Founder", "Maintainer", "Head of Builder"]);
    expect(uniqueTitles.filter((t) => t === "Founder").length).toBe(1);
  });
});
