import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Applicant approval lifecycle contract", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/app/actions/admin.ts"),
    "utf-8"
  );

  it("loads lifecycle fields before approval", () => {
    expect(source).toContain("membership_status");
    expect(source).toContain("reapply_blocked");
    expect(source).toContain("membership_started_at");
    expect(source).toContain("reviewed_by: user.id");
  });

  it("writes active lifecycle state and preserves first approval timestamp", () => {
    expect(source).toContain('membership_status: "active"');
    expect(source).toContain("member.membership_started_at");
    expect(source).toContain("new Date().toISOString()");
  });
});
