"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";
import { PoWInput, validatePoWSubmission } from "@/lib/validation";

export async function submitProofOfWork(data: PoWInput) {
  const validation = validatePoWSubmission(data);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: "Sesi tidak ditemukan. Silakan login kembali dengan GitHub." };
  }

  // Prevent existing approved members from being downgraded
  const { data: existing } = await supabase
    .from("members")
    .select("registration_status, hierarchy")
    .eq("id", user.id)
    .maybeSingle();

  if (existing?.registration_status === "approved") {
    return { success: false, error: "Akun Anda sudah berstatus anggota resmi aktif." };
  }

  const githubUsername =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.email?.split("@")[0] ||
    "user";

  const avatarUrl = user.user_metadata?.avatar_url || null;

  // Insert or update pending profile in public.members
  const { error: dbError } = await supabase.from("members").upsert(
    {
      id: user.id,
      email: user.email || null,
      full_name: data.fullName.trim(),
      avatar_url: avatarUrl,
      nim: data.nim?.trim() || null,
      phone_wa: data.phoneWa?.trim() || null,
      bio: data.toolchainNarrative.trim(),
      hierarchy: "member",
      sub_hierarchy: `member-${data.division}`,
      division: data.division,
      track: data.track.trim(),
      github_username: githubUsername,
      github_url: `https://github.com/${githubUsername}`,
      portfolio_url: data.portfolioUrl.trim(),
      registration_status: "pending",
      is_active: true,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" }
  );

  if (dbError) {
    return { success: false, error: dbError.message };
  }

  // Multi-channel alert to maintainers
  await notifyMaintainers(
    "Pendaftar Proof of Work Baru",
    `Nama: ${data.fullName}\nGitHub: @${githubUsername}\nDivisi: ${data.division} (${data.track})\nPortofolio: ${data.portfolioUrl}\n\nWorkflow: ${data.toolchainNarrative}\n\nReview di: https://muaraai.com/admin/review`
  );

  return { success: true };
}
