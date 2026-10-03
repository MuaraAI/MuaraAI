"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";

export interface PoWInput {
  fullName: string;
  nim?: string;
  phoneWa?: string;
  division: "builder" | "creative";
  track: string;
  portfolioUrl: string;
  toolchainNarrative: string;
}

export function validatePoWSubmission(data: PoWInput): { isValid: boolean; error?: string } {
  if (!data.fullName || data.fullName.trim().length < 3) {
    return { isValid: false, error: "Nama lengkap minimal 3 karakter." };
  }
  if (!data.portfolioUrl || !data.portfolioUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan portofolio/repositori harus berupa URL valid." };
  }
  if (!data.toolchainNarrative || data.toolchainNarrative.trim().length < 15) {
    return { isValid: false, error: "Penjelasan workflow/toolchain minimal 15 karakter." };
  }
  return { isValid: true };
}

export async function submitProofOfWork(data: PoWInput) {
  const validation = validatePoWSubmission(data);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return { success: false, error: "Sesi tidak ditemukan. Silakan login kembali dengan GitHub." };
  }

  const githubUsername =
    session.user.user_metadata?.user_name ||
    session.user.user_metadata?.preferred_username ||
    session.user.email?.split("@")[0] ||
    "user";

  const avatarUrl = session.user.user_metadata?.avatar_url || null;

  // Insert or update pending profile in public.members
  const { error: dbError } = await supabase.from("members").upsert(
    {
      id: session.user.id,
      email: session.user.email || null,
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
