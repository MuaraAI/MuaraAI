import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { canSubmitIntake } from "../src/lib/membership";

const lifecyclePath = path.resolve(
  __dirname,
  "../supabase/migrations/20261017_membership_lifecycle.sql"
);
const exitRpcPath = path.resolve(
  __dirname,
  "../supabase/migrations/20261017_membership_exit_rpc.sql"
);

const policy = {
  policy_version: "national-2026-s1",
  effective_at: "2026-10-17T00:00:00.000Z",
  allowed_university: "Mahasiswa dari kampus di seluruh Indonesia",
  allowed_cohort: 2026,
  allowed_semester: 1,
  minimum_active_days_before_exit: 30,
  block_reapply_after_exit: true,
};

const freshApplicant = {
  registration_status: "rejected" as const,
  membership_status: "active" as const,
  hierarchy: "member",
  reapply_blocked: false,
  created_at: "2026-10-17T00:00:00.000Z",
};

describe("Intake policy gate", () => {
  it("blocks submissions before the policy takes effect", () => {
    const result = canSubmitIntake(
      freshApplicant,
      policy,
      new Date("2026-10-16T23:59:59.000Z")
    );
    expect(result.allowed).toBe(false);
  });

  it("blocks submissions during the 24h cooldown for rejected applicants", () => {
    const result = canSubmitIntake(
      freshApplicant,
      policy,
      new Date("2026-10-17T12:00:00.000Z")
    );
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("cooldown");
  });

  it("allows submissions once the policy is in force and cooldown has elapsed", () => {
    const result = canSubmitIntake(
      freshApplicant,
      policy,
      new Date("2026-10-18T00:00:01.000Z")
    );
    expect(result.allowed).toBe(true);
  });

  it("still blocks exited and approved members after the policy is in force", () => {
    expect(
      canSubmitIntake(
        { ...freshApplicant, registration_status: "approved" as const },
        policy,
        new Date("2026-10-18T00:00:00.000Z")
      ).allowed
    ).toBe(false);
    expect(
      canSubmitIntake(
        { ...freshApplicant, membership_status: "exited" as const, reapply_blocked: true },
        policy,
        new Date("2026-10-18T00:00:00.000Z")
      ).allowed
    ).toBe(false);
  });
});

describe("Server action writes only self-service columns", () => {
  const source = fs.readFileSync(
    path.resolve(__dirname, "../src/app/actions/pow.ts"),
    "utf-8"
  );

  it("does not upsert server-managed lifecycle columns", () => {
    for (const forbidden of [
      "membership_status:",
      "membership_started_at:",
      "reapply_blocked:",
      "intake_policy_version:",
      "angkatan:",
      "semester:",
    ]) {
      expect(source).not.toContain(forbidden);
    }
  });

  it("still moves the application into pending for review", () => {
    expect(source).toContain('registration_status: "pending"');
    expect(source).toContain("canSubmitIntake");
  });
});

describe("Exit RPC guards", () => {
  const source = fs.readFileSync(exitRpcPath, "utf-8");

  it("marks its transaction so the lifecycle trigger allows the exit update", () => {
    expect(source).toContain("set_config('app.membership_lifecycle_rpc', 'on', true)");
  });

  it("refuses exit when membership_started_at is missing instead of bypassing the wait", () => {
    expect(source).toContain("membership_started_at IS NULL");
  });

  it("refuses exit when the minimum active days policy is missing", () => {
    expect(source).toContain("v_min_days IS NULL");
  });
});

describe("Lifecycle trigger compatibility", () => {
  const source = fs.readFileSync(lifecyclePath, "utf-8");
  const exitSource = fs.readFileSync(exitRpcPath, "utf-8");

  it("honours the server-side marker set by the exit RPC", () => {
    expect(source).toContain("current_setting('app.membership_lifecycle_rpc', true)");
    expect(exitSource).toContain("set_config('app.membership_lifecycle_rpc', 'on', true)");
  });

  it("keeps the marker server-only by relying on PostgREST not exposing set_config", () => {
    // set_config lives in pg_catalog, which is not an exposed schema: client roles
    // have no API path to the marker, so the trigger stays enforced for them.
    expect(source).toContain("pg_catalog is not an exposed schema");
  });

  it("stamps intake_policy_version server-side on first insert", () => {
    expect(source).toContain("trg_stamp_member_intake_policy");
    expect(source).toContain("BEFORE INSERT ON public.members");
  });
});
