"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";
import { canRequestExit } from "@/lib/membership";
import { currentLocale } from "@/lib/locale-server";
import type { MembershipIntakePolicy } from "@/types/database";

const EXIT_ERRORS = {
  id: { profile: "Profil member tidak ditemukan.", config: "Konfigurasi membership sedang tidak tersedia.", update: "Gagal memperbarui status membership." },
  en: { profile: "Member profile not found.", config: "The membership configuration is not available right now.", update: "Could not update the membership status." },
} as const;

export async function requestMembershipExit(reason?: string) {
  const locale = await currentLocale();
  const errors = EXIT_ERRORS[locale];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id, github_username, full_name, registration_status, hierarchy, membership_status, membership_started_at, reapply_blocked")
    .eq("id", user.id)
    .maybeSingle();

  if (memberError || !member) {
    return { success: false, error: errors.profile };
  }

  const { data: setting, error: settingError } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .single();

  if (settingError || !setting?.value) {
    return { success: false, error: errors.config };
  }

  const decision = canRequestExit(
    member,
    new Date(),
    setting.value as MembershipIntakePolicy,
    locale
  );

  if (!decision.allowed) {
    return {
      success: false,
      error: decision.reason,
      earliestExitAt: decision.earliestExitAt,
    };
  }

  const { data, error: rpcError } = await supabase.rpc("request_membership_exit", {
    p_reason: reason?.trim().slice(0, 500) || null,
  });

  if (rpcError) {
    return { success: false, error: errors.update };
  }

  const exitedAt = String(data?.exited_at || new Date().toISOString());
  await notifyMaintainers(
    "Member Keluar dari Muara AI",
    `Member @${member.github_username} (${member.full_name}) telah mengajukan keluar.\nWaktu: ${exitedAt}\nAlasan: ${reason?.trim() || "Tidak diberikan"}`
  );

  return { success: true, exitedAt };
}
