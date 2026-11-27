import { describe, expect, it } from "vitest";
import { DIVISIONS, RANKS, applyRole, divisionsOf, headOf, hierarchyFor, isDivision, isRank, roleBadges, teamSlugsFor, validateRoleChange } from "../src/lib/structure";

const positions = { builder: ["Frontend", "Backend", "IoT"], creative: ["Video"], cybersecurity: ["Pentester"] };

const yuken = { hierarchy: "maintainer", roles: ["maintainer", "head-builder"], titles: ["Founder", "Maintainer", "Head of Builder"], division: "builder", divisions: ["builder", "creative", "cybersecurity"], head_of: ["builder"] };
const raffli = { hierarchy: "maintainer", roles: ["maintainer"], titles: ["Co-Founder"], division: "builder", divisions: ["builder", "creative", "cybersecurity"], head_of: ["cybersecurity"] };
const plain = { hierarchy: "member", roles: [], titles: [], division: "creative", divisions: [], head_of: [] };

describe("divisions and ranks", () => {
  it("has three divisions and four ranks, and rejects inherited keys", () => {
    expect(DIVISIONS).toEqual(["builder", "creative", "cybersecurity"]);
    expect(RANKS).toEqual(["maintainer", "head", "lead", "member"]);
    expect(isDivision("cybersecurity")).toBe(true);
    for (const bad of ["constructor", "marketing", undefined, null, 5]) expect(isDivision(bad)).toBe(false);
    expect(isRank("head")).toBe(true);
    expect(isRank("constructor")).toBe(false);
  });
});

describe("divisionsOf and headOf", () => {
  it("lists every division a person belongs to, and falls back to the primary division for old rows", () => {
    expect(divisionsOf(yuken)).toEqual(["builder", "creative", "cybersecurity"]);
    expect(divisionsOf(plain)).toEqual(["creative"]);
    expect(divisionsOf({ division: "marketing", divisions: ["builder", "constructor"] })).toEqual(["builder"]);
    expect(divisionsOf({})).toEqual([]);
  });

  it("only counts heads of divisions that exist", () => {
    expect(headOf(raffli)).toEqual(["cybersecurity"]);
    expect(headOf({ head_of: ["builder", "nonsense"] })).toEqual(["builder"]);
    expect(headOf(plain)).toEqual([]);
  });
});

describe("roleBadges", () => {
  it("shows the honorific, then Maintainer, then each Head role, without duplicating legacy derived titles", () => {
    expect(roleBadges(yuken)).toEqual(["Founder", "Maintainer", "Head of Builder"]);
    expect(roleBadges(raffli)).toEqual(["Co-Founder", "Maintainer", "Head of Cybersecurity"]);
    expect(roleBadges(plain)).toEqual([]);
    expect(roleBadges({ ...plain, head_of: ["creative", "builder"] })).toEqual(["Head of Creative", "Head of Builder"]);
  });
});

describe("teamSlugsFor (the GitHub org teams)", () => {
  it("puts a person in every team their roles imply", () => {
    expect(teamSlugsFor(yuken)).toEqual(["maintainers", "heads", "head-builder", "members", "member-builder", "member-creative", "member-cybersecurity"]);
    expect(teamSlugsFor(plain)).toEqual(["members", "member-creative"]);
    expect(teamSlugsFor({ hierarchy: "lead", division: "builder", divisions: ["builder"] })).toEqual(["leads", "members", "member-builder"]);
  });
});

describe("validateRoleChange", () => {
  const ok = { maintainer: true, divisions: ["builder", "creative", "cybersecurity"], primary: "builder", headOf: ["builder"], tracks: ["Frontend", "Video", "Pentester"] };

  it("accepts several divisions, heads and positions of those divisions", () => {
    expect(validateRoleChange(ok, positions)).toEqual({ ok: true, value: ok });
  });

  it("removes duplicates and ignores blank positions", () => {
    const result = validateRoleChange({ ...ok, divisions: ["builder", "builder"], headOf: [], tracks: ["IoT", "IoT", " "] }, positions);
    expect(result).toEqual({ ok: true, value: { ...ok, divisions: ["builder"], headOf: [], tracks: ["IoT"] } });
  });

  it("rejects anything outside the lists, including inherited keys", () => {
    for (const bad of [
      { ...ok, divisions: [] },
      { ...ok, divisions: ["builder", "marketing"] },
      { ...ok, divisions: ["constructor"], primary: "constructor", headOf: [] },
      { ...ok, primary: "creative", divisions: ["builder"] },
      { ...ok, divisions: ["builder"], headOf: ["creative"] },
      { ...ok, divisions: ["builder"], tracks: ["Video"] },
      { ...ok, tracks: ["x".repeat(80)] },
      { ...ok, maintainer: "yes" },
      null,
      "head",
    ]) {
      expect(validateRoleChange(bad, positions).ok).toBe(false);
    }
  });
});

describe("hierarchyFor", () => {
  it("derives the legacy rank from the access flag and the divisions led", () => {
    expect(hierarchyFor("member", { maintainer: true, headOf: ["builder"] })).toBe("maintainer");
    expect(hierarchyFor("member", { maintainer: false, headOf: ["creative"] })).toBe("head");
    expect(hierarchyFor("head", { maintainer: false, headOf: [] })).toBe("member");
    expect(hierarchyFor("lead", { maintainer: false, headOf: [] })).toBe("lead");
    expect(hierarchyFor(undefined, { maintainer: false, headOf: [] })).toBe("member");
  });
});

describe("applyRole keeps the legacy roles list in agreement", () => {
  it("rewrites the maintainer and head-<division> entries and leaves other roles alone", () => {
    expect(applyRole(["Builder"], { maintainer: true, headOf: ["builder"] })).toEqual(["Builder", "maintainer", "head-builder"]);
    expect(applyRole(["maintainer", "head-builder", "Builder"], { maintainer: false, headOf: ["creative"] })).toEqual(["Builder", "head-creative"]);
    expect(applyRole(null, { maintainer: false, headOf: [] })).toEqual([]);
  });
});
