import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Membership action contracts", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/app/actions/pow.ts"),
    "utf-8"
  );

  it("checks exited and reapply-blocked members through the lifecycle helper", () => {
    expect(source).toContain("canSubmitIntake");
    expect(source).toContain("membership_status, reapply_blocked");
    expect(source).toContain("if (!intakeDecision.allowed)");
  });

  it("loads the intake policy and persists its version", () => {
    expect(source).toContain('eq("key", "membership_intake")');
    expect(source).toContain("intake_policy_version");
    expect(source).toContain("policy.policy_version");
  });
});
