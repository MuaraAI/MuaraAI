import React from "react";
import { redirect } from "next/navigation";
import PoWForm from "@/components/auth/pow-modal";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import { ONBOARDING_COPY } from "@/lib/onboarding-copy";
import type { PoWInput } from "@/lib/validation";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { isDivision } from "@/lib/structure";

const PLACEHOLDER_INSTITUTIONS = ["Tidak disebutkan", "Kampus lain di Indonesia"];

/**
 * The application form.
 *
 * Embedded (inside the dashboard, for someone who signed in with GitHub and has not applied yet) it only renders the form.
 * Standalone (/onboarding, /en/onboarding) the form no longer comes before sign-in: a visitor who is signed out is sent to
 * GitHub sign-in, and someone signed in without an application is sent to the dashboard, where they apply. What stays
 * here is a rejected applicant whose cooldown is over, who comes back to reapply with their earlier answers filled in.
 */
export default async function OnboardingView({ locale, embedded = false }: { locale: Locale; embedded?: boolean }) {
  const t = ONBOARDING_COPY[normalizeLocale(locale)];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!embedded && !user) redirect(normalizeLocale(locale) === "en" ? "/en/join" : "/api/auth/login");

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
          <h2 className="font-display text-2xl font-bold text-foreground mb-2">{t.preparingTitle}</h2>
          <p className="text-sm text-secondary leading-relaxed">{t.preparingBody}</p>
        </div>
      </div>
    );
  }

  let initialData: Partial<PoWInput> | undefined = undefined;
  let rejectionReason: string | undefined = undefined;

  if (user && !embedded) {
    const privileged = await createPrivilegedClient();
    const { data: member } = await privileged
      .from("members")
      .select("id, registration_status, full_name, affiliation, campus, phone_wa, telegram_username, portfolio_url, division, track, secondary_division, secondary_track, join_reason, bio, website_url, linkedin_url, instagram_url, threads_url, x_url, rejection_reason, reviewed_at, updated_at, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!member) redirect("/dashboard");

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
        division: isDivision(member.division) ? member.division : "builder",
        track: member.track || "",
        secondaryDivision: member.secondary_division || undefined,
        secondaryTrack: member.secondary_track || undefined,
        joinReason: member.join_reason || "",
        toolchainNarrative: member.bio || "",
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
    <div className={embedded ? "" : "py-16 px-4 sm:px-6 lg:px-8"}>
      <PoWForm
        githubUsername={githubUsername}
        initialData={initialData}
        rejectionReason={rejectionReason}
        positions={positions}
        locale={locale}
      />
    </div>
  );
}
