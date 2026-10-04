import { describe, it, expect } from "vitest";
import { filterMembers } from "../src/components/landing/syndicate-roster";
import { Member } from "../src/types/database";

describe("Syndicate Roster Filtering", () => {
  const mockMembers: Partial<Member>[] = [
    { id: "1", full_name: "Yuken", hierarchy: "maintainer", division: "builder", total_commits: 150 },
    { id: "2", full_name: "Greeezzz", hierarchy: "member", division: "creative", total_commits: 20 },
    { id: "3", full_name: "Raffli", hierarchy: "maintainer", division: "builder", total_commits: 200 },
  ];

  it("sorts by total_commits descending when filter is 'top-commits'", () => {
    const result = filterMembers(mockMembers as Member[], "top-commits");
    expect(result[0].full_name).toBe("Raffli");
    expect(result[1].full_name).toBe("Yuken");
    expect(result[2].full_name).toBe("Greeezzz");
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
