"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";
import { PoWInput, validatePoWSubmission } from "@/lib/validation";
import { canSubmitIntake } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";

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

  const { data: setting, error: settingError } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .single();

  if (settingError || !setting?.value) {
    return { success: false, error: "Konfigurasi pendaftaran sedang tidak tersedia." };
  }

  const policy = setting.value as MembershipIntakePolicy;
  const { data: existing } = await supabase
    .from("members")
    .select("registration_status, hierarchy, membership_status, reapply_blocked, created_at, reviewed_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const intakeDecision = canSubmitIntake(
    existing,
    policy,
    new Date()
  );
  if (!intakeDecision.allowed) {
    return { success: false, error: intakeDecision.reason };
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
      nim: data.nim.trim(),
      campus: data.campus.trim(),
      prodi: data.prodi.trim(),
      kelas: data.kelas?.trim().toUpperCase() || null,
      phone_wa: data.phoneWa.trim(),
      bio: data.toolchainNarrative.trim(),
      hierarchy: "member",
      sub_hierarchy: `member-${data.division}`,
      division: data.division,
      track: data.track.trim(),
      github_username: githubUsername,
      github_url: `https://github.com/${githubUsername}`,
      portfolio_url: data.portfolioUrl.trim(),
      website_url: data.websiteUrl?.trim() || null,
      linkedin_url: data.linkedinUrl?.trim() || null,
      instagram_url: data.instagramUrl?.trim()
        ? data.instagramUrl.startsWith("http")
          ? data.instagramUrl.trim()
          : `https://instagram.com/${data.instagramUrl.replace(/^@/, "").trim()}`
        : null,
      threads_url: data.threadsUrl?.trim()
        ? data.threadsUrl.startsWith("http")
          ? data.threadsUrl.trim()
          : `https://threads.net/@${data.threadsUrl.replace(/^@/, "").trim()}`
        : null,
      x_url: data.xUrl?.trim()
        ? data.xUrl.startsWith("http")
          ? data.xUrl.trim()
          : `https://x.com/${data.xUrl.replace(/^@/, "").trim()}`
        : null,
      registration_status: "pending",
      rejection_reason: null,
      reviewed_by: null,
      reviewed_at: null,
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
    "Pendaftar Mahasiswa Baru",
    `Nama: ${data.fullName}\nNIM: ${data.nim} (${data.campus} - ${data.prodi}${data.kelas?.trim() ? ` ${data.kelas.trim().toUpperCase()}` : ""})\nGitHub: @${githubUsername}\nDivisi: ${data.division} (${data.track})\nPortofolio: ${data.portfolioUrl}\n\nReview di: https://muaraai.com/admin/review`
  );

  return { success: true };
}
