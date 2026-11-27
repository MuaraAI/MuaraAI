import { describe, expect, it } from "vitest";
import { RANKS, applyRole, groupByRank, isRank, roleLabel, teamSlugsFor, validateRoleChange } from "../src/lib/structure";

const positions = { builder: ["Frontend", "Backend"], creative: ["Video"] };

describe("ranks", () => {
  it("run from maintainer down to member", () => {
    expect(RANKS).toEqual(["maintainer", "head", "lead", "member"]);
    expect(isRank("head")).toBe(true);
    expect(isRank("constructor")).toBe(false);
    expect(isRank(undefined)).toBe(false);
  });
});

describe("roleLabel", () => {
  it("names a head and a lead by division, and a maintainer or member plainly", () => {
    expect(roleLabel({ hierarchy: "maintainer", division: "builder" })).toBe("Maintainer");
    expect(roleLabel({ hierarchy: "head", division: "builder" })).toBe("Head of Builder");
    expect(roleLabel({ hierarchy: "head", division: "creative" })).toBe("Head of Creative");
    expect(roleLabel({ hierarchy: "lead", division: "creative" })).toBe("Creative Lead");
    expect(roleLabel({ hierarchy: "member", division: "builder" })).toBe("Member");
  });
});

describe("teamSlugsFor (the GitHub org teams that exist today)", () => {
  it("maps every rank to its teams", () => {
    expect(teamSlugsFor({ hierarchy: "maintainer", division: "builder" })).toEqual(["maintainers"]);
    expect(teamSlugsFor({ hierarchy: "head", division: "creative" })).toEqual(["heads", "head-creative"]);
    expect(teamSlugsFor({ hierarchy: "lead", division: "builder" })).toEqual(["leads"]);
    expect(teamSlugsFor({ hierarchy: "member", division: "builder" })).toEqual(["members", "member-builder"]);
  });
});

describe("groupByRank", () => {
  it("orders groups by rank, drops empty ones, and sorts people by name", () => {
    const groups = groupByRank([
      { id: "1", full_name: "Zed", hierarchy: "member" },
      { id: "2", full_name: "Yuken", hierarchy: "maintainer" },
      { id: "3", full_name: "Amel", hierarchy: "member" },
    ]);
    expect(groups.map((group) => group.rank)).toEqual(["maintainer", "member"]);
    expect(groups[1].members.map((member) => member.full_name)).toEqual(["Amel", "Zed"]);
  });
});

describe("validateRoleChange", () => {
  const ok = { hierarchy: "head", division: "creative", track: "Video" };

  it("accepts a rank, a division and an official position", () => {
    expect(validateRoleChange(ok, positions)).toEqual({ ok: true, value: ok });
    expect(validateRoleChange({ hierarchy: "lead", division: "builder", track: "" }, positions)).toEqual({
      ok: true,
      value: { hierarchy: "lead", division: "builder", track: null },
    });
  });

  it("rejects anything outside the lists, including inherited keys", () => {
    for (const bad of [
      { ...ok, hierarchy: "owner" },
      { ...ok, hierarchy: "constructor" },
      { ...ok, division: "marketing" },
      { ...ok, track: "Frontend" },
      { ...ok, track: "x".repeat(80) },
      null,
      "head",
    ]) {
      expect(validateRoleChange(bad, positions).ok).toBe(false);
    }
  });
});

describe("applyRole keeps hierarchy and the legacy roles list in agreement", () => {
  it("adds maintainer to roles when promoting, and removes it when demoting", () => {
    expect(applyRole(["Builder"], "maintainer")).toEqual(["Builder", "maintainer"]);
    expect(applyRole(["maintainer", "Builder"], "maintainer")).toEqual(["maintainer", "Builder"]);
    expect(applyRole(["maintainer", "Builder"], "head")).toEqual(["Builder"]);
    expect(applyRole(null, "member")).toEqual([]);
  });
});
