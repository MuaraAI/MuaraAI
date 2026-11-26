import { describe, expect, it } from "vitest";
import { canSubmitIntake } from "../src/lib/membership";

const now = new Date("2026-12-10T10:00:00Z");
const open = { policy_version: "v1", effective_at: "2020-01-01T00:00:00.000Z", minimum_active_days_before_exit: 30, block_reapply_after_exit: true };
const member = (over: Record<string, unknown>) => ({ registration_status: "pending", hierarchy: "member", membership_status: "active", reapply_blocked: false, ...over }) as never;

describe("canSubmitIntake reasons in English", () => {
  it("explains a closed intake window, an exited account, an active member and a cooldown", () => {
    const closed = { ...open, effective_at: "2027-01-01T00:00:00.000Z" };
    expect(canSubmitIntake(member({}), closed, now, "en").reason).toBe("New member registration is not open yet. Please try again after registration starts.");
    expect(canSubmitIntake(member({ membership_status: "exited" }), open, now, "en").reason).toBe("This account has already left and cannot register again.");
    expect(canSubmitIntake(member({ registration_status: "approved" }), open, now, "en").reason).toBe("Your account is already an active member.");
    const rejected = member({ registration_status: "rejected", reviewed_at: "2026-12-10T08:00:00Z" });
    expect(canSubmitIntake(rejected, open, now, "en").reason).toBe("You can reapply after the 24-hour cooldown (about 22 hours left).");
  });

  it("treats inherited object keys like a language it does not know", () => {
    for (const key of ["constructor", "toString", "__proto__"]) {
      expect(canSubmitIntake(member({ registration_status: "approved" }), open, now, key as never).reason).toBe("Akun Anda sudah berstatus anggota resmi aktif.");
    }
  });

  it("keeps the Indonesian reasons by default", () => {
    expect(canSubmitIntake(member({ registration_status: "approved" }), open, now).reason).toBe("Akun Anda sudah berstatus anggota resmi aktif.");
    expect(canSubmitIntake(member({ membership_status: "exited" }), open, now, "fr" as never).reason).toBe("Akun ini sudah pernah keluar dan tidak dapat mendaftar ulang.");
  });
});
