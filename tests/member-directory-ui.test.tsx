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
    expect(screen.getByText("15.1C.30")).toBeTruthy();
    expect(screen.queryByText(/Bio marketing/i)).toBeNull();
    expect(screen.queryByText(/AI Gateway & Systems Architecture/i)).toBeNull();
  });

  it("filters members through the real search control", () => {
    render(<MembersDirectory initialMembers={members} />);
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "tidak ada" } });
    expect(screen.getByText(/Tidak ada anggota/i)).toBeTruthy();
  });
});
