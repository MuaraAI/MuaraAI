import { describe, expect, it } from "vitest";
import { MANAGED_TEAM_SLUGS, desiredTeams, planTeamSync } from "../src/lib/github-teams";

const person = (over: Record<string, unknown>) => ({ registration_status: "approved", membership_status: "active", is_active: true, hierarchy: "member", roles: [], titles: [], head_of: [], divisions: [], division: "builder", ...over });

const yuken = person({ github_username: "Yuken", hierarchy: "maintainer", roles: ["maintainer"], head_of: ["builder"], divisions: ["builder", "creative", "cybersecurity"] });
const verzio = person({ github_username: "Verzio", hierarchy: "maintainer", roles: ["maintainer"], head_of: ["creative"], divisions: ["creative", "builder", "cybersecurity"] });
const plain = person({ github_username: "Plain", divisions: ["builder"] });

describe("managed teams", () => {
  it("are the rank teams plus one head and one member team per division, and never leads", () => {
    expect(MANAGED_TEAM_SLUGS).toEqual([
      "maintainers", "heads", "head-builder", "head-creative", "head-cybersecurity", "members", "member-builder", "member-creative", "member-cybersecurity",
    ]);
  });
});

describe("desiredTeams", () => {
  it("puts each approved, active person in the teams their roles imply, using lowercase usernames", () => {
    const desired = desiredTeams([yuken, verzio, plain] as never);
    expect(desired.maintainers).toEqual(["yuken", "verzio"]);
    expect(desired["head-builder"]).toEqual(["yuken"]);
    expect(desired["head-creative"]).toEqual(["verzio"]);
    expect(desired["head-cybersecurity"]).toEqual([]);
    expect(desired["member-builder"]).toEqual(["yuken", "verzio", "plain"]);
    expect(desired["member-cybersecurity"]).toEqual(["yuken", "verzio"]);
  });

  it("leaves out pending, rejected, exited, deactivated and username-less people", () => {
    const left = [
      person({ github_username: "p", registration_status: "pending" }),
      person({ github_username: "r", registration_status: "rejected" }),
      person({ github_username: "e", membership_status: "exited" }),
      person({ github_username: "d", is_active: false }),
      person({ github_username: "" }),
    ];
    const desired = desiredTeams(left as never);
    expect(Object.values(desired).flat()).toEqual([]);
  });
});

describe("planTeamSync", () => {
  const current = {
    maintainers: ["yuken", "verzio"],
    heads: ["yuken"],
    "head-builder": ["yuken"],
    "head-creative": ["yuken"],
    members: ["yuken", "greeezzz"],
    "member-builder": ["yuken"],
    "member-creative": ["yuken", "greeezzz"],
  };
  const desired = desiredTeams([yuken, verzio, plain] as never);
  const known = new Set(["yuken", "verzio", "plain"]);

  it("asks for the teams that do not exist yet, under the right parent", () => {
    const plan = planTeamSync({ desired, current, known });
    expect(plan.create).toEqual([
      { slug: "head-cybersecurity", parent: "heads" },
      { slug: "member-cybersecurity", parent: "members" },
    ]);
  });

  it("adds missing people and removes known people who no longer belong", () => {
    const plan = planTeamSync({ desired, current, known });
    expect(plan.add).toContainEqual({ team: "heads", user: "verzio" });
    expect(plan.add).toContainEqual({ team: "head-creative", user: "verzio" });
    expect(plan.add).toContainEqual({ team: "member-builder", user: "plain" });
    expect(plan.add).toContainEqual({ team: "member-cybersecurity", user: "yuken" });
    expect(plan.remove).toEqual([{ team: "head-creative", user: "yuken" }]);
  });

  it("never removes someone who is not in the members table (people who have not registered yet)", () => {
    const plan = planTeamSync({ desired, current, known });
    expect(plan.remove.some((item) => item.user === "greeezzz")).toBe(false);
    expect(plan.unknown).toEqual(["greeezzz"]);
  });

  it("does nothing when the teams already match, and ignores teams it does not manage", () => {
    const matching = Object.fromEntries(MANAGED_TEAM_SLUGS.map((slug) => [slug, desired[slug] ?? []]));
    const plan = planTeamSync({ desired, current: { ...matching, leads: ["yuken"], "hackthon-1": ["yuken", "x"] }, known });
    expect(plan).toEqual({ create: [], add: [], remove: [], unknown: [] });
  });

  it("compares usernames without caring about case", () => {
    const plan = planTeamSync({ desired: { ...desired, maintainers: ["yuken"] }, current: { ...current, maintainers: ["Yuken"] }, known });
    expect(plan.add.some((item) => item.team === "maintainers" && item.user === "yuken")).toBe(false);
  });
});
