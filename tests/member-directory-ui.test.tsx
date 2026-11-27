import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import MembersDirectory from "../src/components/members/members-directory";
import type { Member } from "../src/types/database";

const members = [
  {
    id: "m1",
    full_name: "Yuken Velino",
    github_username: "Curzyori",
    role_title: "Founder",
    titles: ["Founder", "Maintainer"],
    division: "builder",
    track: "AI Gateway & Systems Architecture",
    bio: "Bio marketing yang tidak boleh tampil",
    campus: "UBSI Pontianak",
    prodi: "Informatika (S1)",
    kelas: "15.1C.30",
    total_commits: 42,
    tier: 4,
    streak: 3,
    github_url: "https://github.com/Curzyori",
    avatar_url: null,
  },
] as unknown as Member[];

describe("public member directory v3", () => {
  it("shows factual identity and hides marketing bio and track copy", () => {
    render(<MembersDirectory initialMembers={members} />);

    expect(screen.getByText("Yuken Velino")).toBeTruthy();
    expect(screen.getByText("@Curzyori")).toBeTruthy();
    expect(screen.getByText("UBSI Pontianak")).toBeTruthy();
    expect(screen.getByText("Institusi")).toBeTruthy();
    expect(screen.queryByText("15.1C.30")).toBeNull();
    expect(screen.queryByText("Informatika (S1)")).toBeNull();
    expect(screen.queryByText(/Bio marketing/i)).toBeNull();
    expect(screen.queryByText(/AI Gateway & Systems Architecture/i)).toBeNull();
  });

  it("shows the tier and streak instead of a raw contribution count", () => {
    render(<MembersDirectory initialMembers={members} />);
    expect(screen.getByText("Samudra")).toBeTruthy();
    expect(screen.getByText(/3 bulan berturut-turut/)).toBeTruthy();
    expect(screen.queryByText(/kontribusi/i)).toBeNull();
    expect(screen.queryByText(/42/)).toBeNull();
  });

  it("shows every division and every official position a person holds", () => {
    const multi = [{ ...members[0], division: "builder", divisions: ["builder", "creative"], tracks: ["Backend", "Video", "Made Up"] }] as unknown as Member[];
    render(<MembersDirectory initialMembers={multi} positions={{ builder: ["Backend"], creative: ["Video"] }} />);
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("Video")).toBeTruthy();
    expect(screen.queryByText("Made Up")).toBeNull();
    expect(screen.getAllByText("Creative").length).toBeGreaterThan(0);
  });

  it("falls back to the old track columns for rows from before the lists existed", () => {
    const old = [{ ...members[0], division: "builder", track: "Backend", secondary_track: "Video" }] as unknown as Member[];
    render(<MembersDirectory initialMembers={old} positions={{ builder: ["Backend"], creative: ["Video"] }} />);
    expect(screen.getByText("Backend")).toBeTruthy();
    expect(screen.getByText("Video")).toBeTruthy();
  });

  it("shows Founder, Maintainer and Head of ... badges, and filters by division membership and by Head", () => {
    const people = [
      { id: "1", full_name: "Yuken Tester", github_username: "y", hierarchy: "maintainer", roles: ["maintainer"], titles: ["Founder"], division: "builder", divisions: ["builder", "creative", "cybersecurity"], head_of: ["builder"], tracks: [] },
      { id: "2", full_name: "Plain Builder", github_username: "p", hierarchy: "member", roles: [], titles: [], division: "builder", divisions: ["builder"], head_of: [], tracks: [] },
    ] as unknown as Member[];
    render(<MembersDirectory initialMembers={people} />);
    expect(screen.getByText("Founder")).toBeTruthy();
    expect(screen.getByText("Head of Builder")).toBeTruthy();

    fireEvent.click(screen.getByRole("tab", { name: "Cybersecurity" }));
    expect(screen.getByText("Yuken Tester")).toBeTruthy();
    expect(screen.queryByText("Plain Builder")).toBeNull();

    fireEvent.click(screen.getByRole("tab", { name: "Head" }));
    expect(screen.getByText("Yuken Tester")).toBeTruthy();
    expect(screen.queryByText("Plain Builder")).toBeNull();
  });

  it("filters members through the real search control", () => {
    render(<MembersDirectory initialMembers={members} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "tidak ada" } });
    expect(screen.getByText(/Tidak ada anggota/i)).toBeTruthy();
  });
});
