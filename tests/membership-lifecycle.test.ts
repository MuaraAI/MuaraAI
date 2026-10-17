import { describe, expect, it } from "vitest";
import { canRequestExit, canSubmitIntake, getEarliestExitDate } from "../src/lib/membership";

const policy = {
  policy_version: "ubsi-2026-s1",
  effective_at: "2026-10-17T00:00:00.000Z",
  allowed_university: "Universitas Bina Sarana Informatika",
  allowed_cohort: 2026,
  allowed_semester: 1,
  minimum_active_days_before_exit: 30,
  block_reapply_after_exit: true,
};

it("blocks an existing approved Founder from submitting intake again", () => {
  const result = canSubmitIntake({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "maintainer",
    reapply_blocked: false,
    created_at: "2026-10-01T00:00:00.000Z",
  }, policy, new Date("2026-10-17T00:00:00.000Z"));
  expect(result.allowed).toBe(false);

  const submitDecision = canSubmitIntake({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "maintainer",
    reapply_blocked: false,
    created_at: "2026-10-01T00:00:00.000Z",
  }, policy, new Date("2026-10-17T00:00:00.000Z"));
  expect(submitDecision.allowed).toBe(false);
});

it("blocks exited members from reapplying", () => {
  const result = canSubmitIntake({
    registration_status: "approved",
    membership_status: "exited",
    hierarchy: "member",
    reapply_blocked: true,
    created_at: "2026-10-01T00:00:00.000Z",
  }, policy, new Date("2026-10-17T00:00:00.000Z"));
  expect(result.allowed).toBe(false);
});

it("allows exit only after thirty complete days", () => {
  expect(getEarliestExitDate("2026-10-01T12:00:00.000Z", 30)?.toISOString())
    .toBe("2026-10-31T12:00:00.000Z");
  expect(canRequestExit({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "member",
    reapply_blocked: false,
    membership_started_at: "2026-10-01T12:00:00.000Z",
  }, new Date("2026-10-30T12:00:00.000Z"), policy).allowed).toBe(false);
  expect(canRequestExit({
    registration_status: "approved",
    membership_status: "active",
    hierarchy: "member",
    reapply_blocked: false,
    membership_started_at: "2026-10-01T12:00:00.000Z",
  }, new Date("2026-10-31T12:00:00.000Z"), policy).allowed).toBe(true);
});
