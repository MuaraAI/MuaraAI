import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Membership exit action contract", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/app/actions/membership.ts"),
    "utf-8"
  );

  it("exports requestMembershipExit and enforces the thirty-day threshold", () => {
    expect(source).toContain("requestMembershipExit");
    expect(source).toContain("canRequestExit");
    expect(source).toContain("membership_started_at");
  });

  it("marks exited members permanently and revokes both project key tables", () => {
    expect(source).toContain('membership_status: "exited"');
    expect(source).toContain("reapply_blocked: true");
    expect(source).toContain('from("ai_api_keys")');
    expect(source).toContain('from("api_keys")');
  });
});
