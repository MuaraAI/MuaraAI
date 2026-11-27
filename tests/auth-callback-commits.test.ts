import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const source = fs.readFileSync(path.resolve(__dirname, "../src/app/api/auth/callback/route.ts"), "utf8");

describe("OAuth callback", () => {
  it("no longer syncs GitHub commits on every login (the contribution engine and the admin button own that)", () => {
    expect(source).not.toContain("fetchMemberOrgCommits");
    expect(source).not.toContain("total_commits");
  });

  it("routes everyone to the dashboard (newcomers apply there), failures to the login page, and rejects open redirects", () => {
    expect(source).toContain('"/dashboard"');
    expect(source).toContain("/login?error=oauth_failed");
    expect(source).toContain('next.startsWith("/") && !next.startsWith("//")');
  });
});
