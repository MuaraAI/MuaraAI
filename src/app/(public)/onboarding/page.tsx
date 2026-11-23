import React from "react";
import { redirect } from "next/navigation";
import PoWForm from "@/components/auth/pow-modal";
import { createClient } from "@/lib/supabase/server";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import type { PoWInput } from "@/lib/validation";

const PLACEHOLDER_INSTITUTIONS = ["Tidak disebutkan", "Kampus lain di Indonesia"];

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: positionsSetting } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", POSITIONS_SETTING_KEY)
    .single();
  const positions = parsePositions(positionsSetting?.value);

  if (!positions) {
    return (
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="px-card bg-white p-8 text-center max-w-lg mx-auto">
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">Pendaftaran sedang disiapkan</h2>
          <p className="text-sm text-secondary leading-relaxed">Daftar posisi belum tersedia. Coba lagi beberapa saat lagi.</p>
        </div>
      </div>
    );
  }

  let initialData: Partial<PoWInput> | undefined = undefined;
  let rejectionReason: string | undefined = undefined;

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("id, registration_status, full_name, affiliation, campus, phone_wa, telegram_username, portfolio_url, division, track, secondary_division, secondary_track, join_reason, bio, toolchain_narrative, website_url, linkedin_url, instagram_url, threads_url, x_url, rejection_reason, reviewed_at, updated_at, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (member?.registration_status === "approved" || member?.registration_status === "pending") {
      redirect("/dashboard");
    }

    if (member?.registration_status === "rejected") {
      const rawTime = member.reviewed_at || member.updated_at || member.created_at;
      const rejectionTimestamp = rawTime ? new Date(rawTime).getTime() : 0;
      const cooldownMs = 24 * 60 * 60 * 1000;
      const canReapply = Date.now() >= rejectionTimestamp + cooldownMs;

      if (!canReapply) {
        redirect("/dashboard");
      }

      rejectionReason = member.rejection_reason || undefined;
      initialData = {
        fullName: member.full_name || "",
        affiliation: member.affiliation || "mahasiswa",
        institution: PLACEHOLDER_INSTITUTIONS.includes(member.campus) ? "" : member.campus || "",
        phoneWa: member.phone_wa || "",
        telegramUsername: member.telegram_username || "",
        division: member.division === "creative" ? "creative" : "builder",
        track: member.track || "",
        secondaryDivision: member.secondary_division || undefined,
        secondaryTrack: member.secondary_track || undefined,
        joinReason: member.join_reason || "",
        toolchainNarrative: member.bio || member.toolchain_narrative || "",
        portfolioUrl: member.portfolio_url || "",
        websiteUrl: member.website_url || "",
        linkedinUrl: member.linkedin_url || "",
        instagramUrl: member.instagram_url || "",
        threadsUrl: member.threads_url || "",
        xUrl: member.x_url || "",
      };
    }
  }

  const githubUsername = user
    ? user.user_metadata?.user_name || user.user_metadata?.preferred_username
    : undefined;

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <PoWForm
        authenticated={Boolean(user)}
        githubUsername={githubUsername}
        initialData={initialData}
        rejectionReason={rejectionReason}
        positions={positions}
      />
    </div>
  );
}
