"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";
import { PoWInput, normalizeTelegram, validatePoWSubmission, type Locale } from "@/lib/validation";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import { canSubmitIntake } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";

const MESSAGES: Record<Locale, { noSession: string; noPositions: string; noIntake: string; generic: string }> = {
  id: {
    noSession: "Sesi tidak ditemukan. Silakan login kembali dengan GitHub.",
    noPositions: "Daftar posisi belum dikonfigurasi.",
    noIntake: "Konfigurasi pendaftaran sedang tidak tersedia.",
    generic: "Terjadi kesalahan pada server. Silakan coba lagi.",
  },
  en: {
    noSession: "No session found. Please sign in with GitHub again.",
    noPositions: "The position list has not been configured.",
    noIntake: "Registration is currently unavailable.",
    generic: "Something went wrong on the server. Please try again.",
  },
};
const NO_INSTITUTION = "Tidak disebutkan";
const REASON_PREVIEW_LENGTH = 300;

function socialUrl(value: string | undefined, base: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith("http") ? trimmed : `${base}${trimmed.replace(/^@/, "")}`;
}

/** `language` comes from the client, so anything other than "en" means Indonesian. */
export async function submitProofOfWork(data: PoWInput, language?: unknown) {
  const locale: Locale = language === "en" ? "en" : "id";
  const text = MESSAGES[locale];
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, error: text.noSession };
  }

  const { data: positionsSetting } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", POSITIONS_SETTING_KEY)
    .single();
  const positions = parsePositions(positionsSetting?.value);
  if (!positions) {
    return { success: false, error: text.noPositions };
  }

  const validation = validatePoWSubmission(data, positions, locale);
  if (!validation.isValid) {
    return { success: false, error: validation.error };
  }

  const { data: setting, error: settingError } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .single();

  if (settingError || !setting?.value) {
    return { success: false, error: text.noIntake };
  }

  const policy = setting.value as MembershipIntakePolicy;
  const { data: existing } = await supabase
    .from("members")
    .select("registration_status, hierarchy, membership_status, reapply_blocked, created_at, reviewed_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const intakeDecision = canSubmitIntake(existing, policy, new Date(), locale);
  if (!intakeDecision.allowed) {
    return { success: false, error: intakeDecision.reason };
  }

  const githubUsername =
    user.user_metadata?.user_name ||
    user.user_metadata?.preferred_username ||
    user.email?.split("@")[0] ||
    "user";

  const avatarUrl = user.user_metadata?.avatar_url || null;
  const institution = data.institution?.trim() || NO_INSTITUTION;
  const joinReason = data.joinReason.trim();
  const telegram = normalizeTelegram(data.telegramUsername);

  // Insert or update pending profile in public.members
  const { error: dbError } = await supabase.from("members").upsert(
    {
      id: user.id,
      email: user.email || null,
      full_name: data.fullName.trim(),
      avatar_url: avatarUrl,
      campus: institution,
      affiliation: data.affiliation,
      phone_wa: data.phoneWa.trim(),
      telegram_username: telegram,
      join_reason: joinReason,
      bio: data.toolchainNarrative.trim(),
      hierarchy: "member",
      sub_hierarchy: `member-${data.division}`,
      division: data.division,
      track: data.track,
      secondary_division: data.secondaryDivision || null,
      secondary_track: data.secondaryDivision ? data.secondaryTrack ?? null : null,
      github_username: githubUsername,
      github_url: `https://github.com/${githubUsername}`,
      portfolio_url: data.portfolioUrl.trim(),
      website_url: data.websiteUrl?.trim() || null,
      linkedin_url: data.linkedinUrl?.trim() || null,
      instagram_url: socialUrl(data.instagramUrl, "https://instagram.com/"),
      threads_url: socialUrl(data.threadsUrl, "https://threads.net/@"),
      x_url: socialUrl(data.xUrl, "https://x.com/"),
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
    console.error("[pow:submitProofOfWork]", dbError.message);
    return { success: false, error: text.generic };
  }

  const reasonPreview =
    joinReason.length > REASON_PREVIEW_LENGTH ? `${joinReason.slice(0, REASON_PREVIEW_LENGTH)}...` : joinReason;
  const secondaryLine = data.secondaryDivision
    ? `\nDivisi kedua: ${data.secondaryDivision} (${data.secondaryTrack})`
    : "";

  // Multi-channel alert to maintainers
  await notifyMaintainers(
    "Pendaftar baru",
    `Nama: ${data.fullName}\nStatus: ${data.affiliation}${institution !== NO_INSTITUTION ? ` (${institution})` : ""}\nGitHub: @${githubUsername}\nDivisi: ${data.division} (${data.track})${secondaryLine}\nPortofolio: ${data.portfolioUrl}\nAlasan: ${reasonPreview}\n\nReview di: https://muaraai.com/admin/review`
  );

  return { success: true };
}
