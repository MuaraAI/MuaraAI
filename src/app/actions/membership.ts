"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";
import { canRequestExit } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";

export async function requestMembershipExit(reason?: string) {
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
    return { success: false, error: "Profil member tidak ditemukan." };
  }

  const { data: setting, error: settingError } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .single();

  if (settingError || !setting?.value) {
    return { success: false, error: "Konfigurasi membership sedang tidak tersedia." };
  }

  const decision = canRequestExit(
    member,
    new Date(),
    setting.value as MembershipIntakePolicy
  );

  if (!decision.allowed) {
    return {
      success: false,
      error: decision.reason,
      earliestExitAt: decision.earliestExitAt,
    };
  }

  const exitedAt = new Date().toISOString();
  const { error: updateError } = await supabase
    .from("members")
    .update({
      membership_status: "exited",
      is_active: false,
      reapply_blocked: true,
      exited_at: exitedAt,
      exit_reason: reason?.trim().slice(0, 500) || null,
    })
    .eq("id", user.id)
    .eq("membership_status", "active")
    .eq("reapply_blocked", false);

  if (updateError) {
    return { success: false, error: "Gagal memperbarui status membership." };
  }

  const [aiResult, ubsiResult] = await Promise.all([
    supabase.from("ai_api_keys").update({ is_active: false }).eq("user_id", user.id),
    supabase.from("api_keys").update({ is_active: false }).eq("user_id", user.id),
  ]);

  if (aiResult.error || ubsiResult.error) {
    console.error("[membership] API key revocation failed", aiResult.error, ubsiResult.error);
  }

  await notifyMaintainers(
    "Member Keluar dari Muara AI",
    `Member @${member.github_username} (${member.full_name}) telah mengajukan keluar.\nWaktu: ${exitedAt}\nAlasan: ${reason?.trim() || "Tidak diberikan"}`
  );

  return { success: true, exitedAt };
}

export async function getMembershipExitStatus() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: member, error } = await supabase
    .from("members")
    .select("membership_status, membership_started_at, exited_at, exit_reason, reapply_blocked, registration_status")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !member) return { success: false, error: "Profil member tidak ditemukan." };
  return { success: true, member };
}
