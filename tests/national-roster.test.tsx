import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import SyndicateRoster, { coreTeam } from "../src/components/landing/syndicate-roster";
import type { Member } from "../src/types/database";

const all = ["builder", "creative", "cybersecurity"];
const person = (over: Record<string, unknown>) => ({ avatar_url: null, github_url: null, linkedin_url: null, tracks: [], titles: [], roles: [], head_of: [], ...over }) as unknown as Member;

const members = [
  person({ id: "3", full_name: "Muhammad Raffli Aldiansyah", github_username: "Seeyaa77", hierarchy: "maintainer", roles: ["maintainer"], titles: ["Co-Founder"], division: "builder", divisions: all, head_of: ["cybersecurity"] }),
  person({ id: "9", full_name: "Plain Member", github_username: "plain", hierarchy: "member", division: "builder", divisions: ["builder"] }),
  person({ id: "1", full_name: "Yuken Velino", github_username: "Curzyori", hierarchy: "maintainer", roles: ["maintainer", "head-builder"], titles: ["Founder", "Maintainer", "Head of Builder"], division: "builder", divisions: all, head_of: ["builder"], tracks: ["Backend"] }),
  person({ id: "2", full_name: "Verzio Yamanansyah", github_username: "MyKineID", hierarchy: "maintainer", roles: ["maintainer"], titles: ["Co-Founder"], division: "builder", divisions: all, head_of: ["creative"] }),
];

describe("maintainer roster from the members table", () => {
  it("lists only maintainers: founder first, then co-founders by name", () => {
    expect(coreTeam(members).map((member) => member.full_name)).toEqual(["Yuken Velino", "Muhammad Raffli Aldiansyah", "Verzio Yamanansyah"]);
  });

  it("shows each person's honorific, roles, divisions and positions from the data", () => {
    render(<SyndicateRoster initialMembers={members} />);
    const list = (label: string) => screen.getByRole("list", { name: label }).textContent;

    expect(list("Peran Yuken Velino")).toBe("MaintainerHead of Builder");
    expect(list("Peran Muhammad Raffli Aldiansyah")).toBe("MaintainerHead of Cybersecurity");
    expect(list("Peran Verzio Yamanansyah")).toBe("MaintainerHead of Creative");
    for (const name of ["Yuken Velino", "Muhammad Raffli Aldiansyah", "Verzio Yamanansyah"]) {
      expect(list(`Divisi ${name}`)).toBe("BuilderCreativeCybersecurity");
    }
    expect(list("Posisi Yuken Velino")).toBe("Backend");
    expect(screen.queryByRole("list", { name: "Posisi Verzio Yamanansyah" })).toBeNull();
    expect(screen.getByText("Founder")).toBeTruthy();
    expect(screen.getAllByText("Co-Founder")).toHaveLength(2);
    expect(screen.queryByText("Plain Member")).toBeNull();
  });

  it("does not expose student ids or invent people when the table has no maintainer", () => {
    const { container } = render(<SyndicateRoster initialMembers={[members[1]]} />);
    expect(container.textContent).toBe("");
    expect(document.body.textContent).not.toMatch(/NIM|15260\d+/);
  });
});
