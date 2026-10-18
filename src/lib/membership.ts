import type { MembershipIntakePolicy, MembershipStatus, RegistrationStatus } from "@/types/database";

interface MembershipSnapshot {
  registration_status: RegistrationStatus;
  membership_status?: MembershipStatus;
  hierarchy?: string;
  reapply_blocked?: boolean;
  created_at?: string;
  reviewed_at?: string | null;
  updated_at?: string;
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
  const effectiveAt = new Date(policy.effective_at);
  if (!Number.isNaN(effectiveAt.getTime()) && now < effectiveAt) {
    return {
      allowed: false,
      reason: "Pendaftaran anggota baru belum dibuka. Silakan coba lagi setelah jadwal pendaftaran dimulai.",
    };
  }
  if (member.reapply_blocked || member.membership_status === "exited") {
    return { allowed: false, reason: "Akun ini sudah pernah keluar dan tidak dapat mendaftar ulang." };
  }
  if (member.registration_status === "approved") {
    return { allowed: false, reason: "Akun Anda sudah berstatus anggota resmi aktif." };
  }
  if (member.registration_status === "rejected") {
    const rawTime = member.reviewed_at || member.updated_at || member.created_at;
    if (rawTime) {
      const rejectionTimestamp = new Date(rawTime).getTime();
      const cooldownMs = 24 * 60 * 60 * 1000;
      if (!Number.isNaN(rejectionTimestamp) && now.getTime() < rejectionTimestamp + cooldownMs) {
        const remainingHours = Math.max(1, Math.ceil((rejectionTimestamp + cooldownMs - now.getTime()) / (60 * 60 * 1000)));
        return {
          allowed: false,
          reason: `Pendaftaran ulang baru dapat diajukan setelah cooldown 24 jam (sisa ~${remainingHours} jam).`,
        };
      }
    }
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
