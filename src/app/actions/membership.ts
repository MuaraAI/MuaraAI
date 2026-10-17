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

  const { data, error: rpcError } = await supabase.rpc("request_membership_exit", {
    p_reason: reason?.trim().slice(0, 500) || null,
  });

  if (rpcError) {
    return { success: false, error: "Gagal memperbarui status membership." };
  }

  const exitedAt = String(data?.exited_at || new Date().toISOString());
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
