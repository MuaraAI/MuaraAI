import type { MembershipIntakePolicy, MembershipStatus, RegistrationStatus } from "@/types/database";

interface MembershipSnapshot {
  registration_status: RegistrationStatus;
  membership_status?: MembershipStatus;
  hierarchy?: string;
  reapply_blocked?: boolean;
  created_at?: string;
  membership_started_at?: string | null;
}

interface PolicyDecision {
  allowed: boolean;
  reason?: string;
  earliestExitAt?: string;
}

export function getEarliestExitDate(startedAt: string | null | undefined, minimumDays: number): Date | null {
  if (!startedAt) return null;
  const date = new Date(startedAt);
  if (Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + minimumDays);
  return date;
}

export function canSubmitIntake(
  member: MembershipSnapshot | null,
  policy: MembershipIntakePolicy,
  now: Date
): PolicyDecision {
  if (!member) return { allowed: true };
  if (member.reapply_blocked || member.membership_status === "exited") {
    return { allowed: false, reason: "Akun ini sudah pernah keluar dan tidak dapat mendaftar ulang." };
  }
  if (member.registration_status === "approved") {
    return { allowed: false, reason: "Akun Anda sudah berstatus anggota resmi aktif." };
  }
  return { allowed: true };
}

export function canRequestExit(
  member: MembershipSnapshot,
  now: Date,
  policy: MembershipIntakePolicy
): PolicyDecision {
  if (member.reapply_blocked || member.membership_status === "exited") {
    return { allowed: false, reason: "Membership ini sudah berstatus keluar." };
  }
  if (member.registration_status !== "approved") {
    return { allowed: false, reason: "Hanya member approved yang dapat mengajukan keluar." };
  }
  if (member.membership_status !== "active") {
    return { allowed: false, reason: "Membership ini tidak sedang aktif." };
  }
  if (member.hierarchy === "maintainer" && !member.membership_started_at) {
    return { allowed: false, reason: "Pengajuan keluar Founder/Maintainer historis diproses oleh maintainer." };
  }

  const earliest = getEarliestExitDate(
    member.membership_started_at,
    policy.minimum_active_days_before_exit
  );
  if (!earliest) {
    return { allowed: false, reason: "Tanggal mulai membership belum tersedia." };
  }
  if (now < earliest) {
    return {
      allowed: false,
      earliestExitAt: earliest.toISOString(),
      reason: `Anda baru dapat mengajukan keluar mulai ${earliest.toLocaleDateString("id-ID")}.`,
    };
  }
  return { allowed: true, earliestExitAt: earliest.toISOString() };
}
