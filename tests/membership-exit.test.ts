import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Membership exit action contract", () => {
  const actionSource = fs.readFileSync(
    path.resolve(__dirname, "../src/app/actions/membership.ts"),
    "utf-8"
  );
  const migrationSource = fs.readFileSync(
    path.resolve(__dirname, "../supabase/migrations/20261017_membership_exit_rpc.sql"),
    "utf-8"
  );

  it("exports requestMembershipExit and enforces the thirty-day threshold", () => {
    expect(actionSource).toContain("requestMembershipExit");
    expect(actionSource).toContain("canRequestExit");
    expect(actionSource).toContain("membership_started_at");
  });

  it("uses the trusted RPC for permanent exit and schema-qualified key revocation", () => {
    expect(actionSource).toContain('rpc("request_membership_exit"');
    expect(migrationSource).toContain("membership_status = 'exited'");
    expect(migrationSource).toContain("reapply_blocked = true");
    expect(migrationSource).toContain("UPDATE ai.api_keys");
    expect(migrationSource).toContain("UPDATE ubsi_api.api_keys");
  });
});
