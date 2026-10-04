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
      nim: data.nim.trim(),
      campus: data.campus.trim(),
      prodi: data.prodi.trim(),
      kelas: data.kelas.trim().toUpperCase(),
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
    "Pendaftar Mahasiswa UBSI Baru",
    `Nama: ${data.fullName}\nNIM: ${data.nim} (${data.campus} - ${data.prodi} ${data.kelas.trim().toUpperCase()})\nGitHub: @${githubUsername}\nDivisi: ${data.division} (${data.track})\nPortofolio: ${data.portfolioUrl}\n\nReview di: https://muaraai.com/admin/review`
  );

  return { success: true };
}
