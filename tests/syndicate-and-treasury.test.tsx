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

  it("filters correctly by core team", () => {
    const core = filterMembers(mockMembers as Member[], "core");
    expect(core.length).toBe(2);
  });
});
