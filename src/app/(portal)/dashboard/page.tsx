import React from "react";
import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { Member } from "@/types/database";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/ui/icon";
import { getEarliestExitDate } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";
import OnboardingView from "@/components/auth/onboarding-view";
import { currentLocale } from "@/lib/locale-server";
import { AFFILIATION_LABELS_BY_LOCALE, DATE_LOCALE, PORTAL_COPY } from "@/lib/portal-copy";
import { PortalHeader } from "@/components/ui/section";
import ContributionCard from "@/components/portal/contribution-card";
import TierBadge from "@/components/members/tier-badge";
import SessionsSection from "@/components/portal/sessions-section";
import { monthStart, parseRules, type ContributionRules, type MonthlyStats } from "@/lib/contributions/rules";

export default async function DashboardProfilePage() {
  const locale = await currentLocale();
  const t = PORTAL_COPY[locale].dashboard;
  const dateLocale = DATE_LOCALE[locale];
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberData } = user
    ? await (await createPrivilegedClient()).from("members").select("*").eq("id", user.id).maybeSingle()
    : { data: null };

  if (!memberData) {
    // Signed in but not applied yet: the application form lives here, inside the dashboard.
    return (
      <div className="space-y-8">
        <PortalHeader eyebrow={t.eyebrow} title={t.applyTitle}>
          {t.applyIntro}
        </PortalHeader>
        {await OnboardingView({ locale, embedded: true })}
      </div>
    );
  }

  const member = memberData as Member;
  const { data: intakeSetting } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .maybeSingle();
  const intakePolicy = intakeSetting?.value as MembershipIntakePolicy | undefined;
  const earliestExitAt = intakePolicy
    ? getEarliestExitDate(member.membership_started_at, intakePolicy.minimum_active_days_before_exit)
    : null;

  let contribution: { stats: MonthlyStats | null; rules: ContributionRules; month: string } | null = null;
  if (member.registration_status === "approved" && member.membership_status === "active") {
    const month = monthStart(new Date());
    const { data: statsRow } = await (await createPrivilegedClient())
      .from("monthly_contributions")
      .select("merged_prs, external_prs, commits, new_repos, new_works")
      .eq("member_id", member.id)
      .eq("month", month)
      .maybeSingle();
    const { data: rulesSetting } = await supabase
      .from("community_settings")
      .select("value")
      .eq("key", "contribution_rules")
      .maybeSingle();
    contribution = {
      month,
      rules: parseRules(rulesSetting?.value),
      stats: statsRow
        ? {
            mergedPrs: statsRow.merged_prs,
            externalPrs: statsRow.external_prs,
            commits: statsRow.commits,
            newRepos: statsRow.new_repos,
            newWorks: statsRow.new_works,
          }
        : null,
    };
  }

  const rawRejectionTime = member.reviewed_at || member.updated_at || member.created_at;
  const rejectionTimestamp = rawRejectionTime ? new Date(rawRejectionTime).getTime() : 0;
  const cooldownMs = 24 * 60 * 60 * 1000;
  const nextEligibleTime = rejectionTimestamp + cooldownMs;
  const canReapply = Date.now() >= nextEligibleTime;
  const remainingHours = Math.max(1, Math.ceil((nextEligibleTime - Date.now()) / (60 * 60 * 1000)));

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow={t.eyebrow} title={t.title}>
        {t.intro}
      </PortalHeader>

      {member.registration_status === "rejected" ? (
        <section className="px-frame [--px-line:#FDA4AF] bg-rose-50/60 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-mono uppercase text-rose-800">{t.registrationStatus}</div>
                <div className="mt-1 flex items-center gap-2 text-xl font-display font-bold text-rose-700">
                  <span className="h-2.5 w-2.5 bg-rose-500" aria-hidden="true" />
                  {t.rejectedTitle}
                </div>
              </div>

              <div className="px-frame [--px-line:#FDA4AF] bg-white/80 p-3.5 text-xs text-secondary">
                <div className="font-semibold text-rose-900 mb-1">{t.coreNote}</div>
                <p className="leading-relaxed text-foreground">
                  {member.rejection_reason || t.defaultRejection}
                </p>
              </div>

              <p className="text-xs text-secondary">
                {canReapply ? t.cooldownOver : t.cooldownRunning(remainingHours)}
              </p>
            </div>

            <div className="shrink-0">
              {canReapply ? (
                <Link
                  href={PORTAL_COPY[locale].onboardingHref}
                  className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  <span>{t.reapply}</span>
                </Link>
              ) : (
                <span className="px-btn-ghost [--px-off:3px] inline-flex min-h-11 items-center justify-center gap-2 bg-white/80 px-4 py-2.5 text-xs font-mono font-medium text-rose-700">
                  <Icon name="schedule" className="w-4 h-4 text-rose-500" />
                  <span>{t.cooldownBadge(remainingHours)}</span>
                </span>
              )}
            </div>
          </div>
        </section>
      ) : member.registration_status === "pending" ? (
        <section className="px-frame [--px-line:#FCD34D] bg-amber-50/60 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-amber-800">{t.registrationStatus}</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-display font-bold text-amber-700">
                <span className="h-2.5 w-2.5 bg-amber-500" aria-hidden="true" />
                {t.pendingTitle}
              </div>
              <p className="mt-2 text-sm text-secondary">
                {t.pendingBody}
              </p>
            </div>
            <span className="px-btn-ghost [--px-off:3px] inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold text-amber-800">
              {t.inQueue}
            </span>
          </div>
        </section>
      ) : (
        <section className="px-card bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-secondary">{t.membershipStatus}</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-display font-bold text-foreground">
                <span className="h-2.5 w-2.5 bg-status-success" aria-hidden="true" />
                {t.active}
              </div>
              <p className="mt-2 text-sm text-secondary">{t.activeBody}</p>
            </div>
            <Link href="/dashboard/learn" className="px-btn inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold transition-colors">
              {t.keepLearning}
            </Link>
          </div>
        </section>
      )}

      {contribution && (
        <ContributionCard
          division={member.division === "creative" ? "creative" : "builder"}
          stats={contribution.stats}
          rules={contribution.rules}
          standing={member.contribution_standing ?? "good"}
          month={contribution.month}
          locale={locale}
        />
      )}

      {contribution && <SessionsSection memberId={member.id} locale={locale} />}

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/learn" className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 transition-colors">
          <div className="text-xs font-mono uppercase text-secondary">{t.next}</div>
          <div className="mt-2 font-display font-semibold text-foreground">{t.openLearn}</div>
        </Link>
        <Link href="/membership-exit" className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 transition-colors">
          <div className="text-xs font-mono uppercase text-secondary">{t.lifecycle}</div>
          <div className="mt-2 font-display font-semibold text-foreground">{t.viewMembership}</div>
        </Link>
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">{t.fullProfile}</h2>
        <span className="text-xs text-secondary">{t.verifiedData}</span>
      </div>

      {member.registration_status === "pending" && (
        <div className="px-frame [--px-line:#FCD34D] bg-amber-50 p-5 text-xs text-amber-900 flex items-start gap-3">
          <Icon name="pending" className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-foreground mb-0.5">{t.pendingBannerTitle}</div>
            {t.pendingBanner}
          </div>
        </div>
      )}

      {member.membership_started_at && member.membership_status === "active" && (
        <div className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-secondary">{t.lifecycleTitle}</div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {t.activeSince(new Date(member.membership_started_at).toLocaleDateString(dateLocale))}
            </div>
            <div className="mt-1 text-xs text-secondary">
              {earliestExitAt
                ? t.exitFrom(earliestExitAt.toLocaleDateString(dateLocale))
                : t.exitUnknown}
            </div>
          </div>
          <Link
            href="/membership-exit"
            className="px-btn-ghost [--px-off:3px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground hover:text-muara-ocean transition-colors"
          >
            <Icon name="logout" className="w-4 h-4" />
            {t.requestExit}
          </Link>
        </div>
      )}

      {/* Main Details Card */}
      <div className="px-card bg-white p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stroke">
          <div>
            <div className="text-xs font-mono text-secondary uppercase">{t.fullName}</div>
            <div className="font-display text-xl font-bold text-foreground mt-0.5">{member.full_name}</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(
              new Set(
                [member.role_title, ...(member.titles || [])].filter((t): t is string =>
                  Boolean(t && t.trim())
                )
              )
            ).map((title, idx) => (
              <span
                key={idx}
                className="bg-surface-alt border border-stroke px-2.5 py-1 text-xs font-mono text-muara-ocean font-semibold"
              >
                {title}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.institution}</div>
            <div className="text-foreground font-mono font-bold">{member.campus || "-"}</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.status}</div>
            <div className="text-foreground font-mono">{AFFILIATION_LABELS_BY_LOCALE[locale][member.affiliation] ?? "-"}</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.github}</div>
            <div className="text-foreground font-mono">@{member.github_username}</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.divisionPosition}</div>
            <div className="text-foreground font-mono capitalize">
              {member.division} ({member.track || "-"})
              {member.secondary_division ? ` + ${member.secondary_division} (${member.secondary_track || "-"})` : ""}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.tier}</div>
            <div className="text-foreground font-mono">
              {member.tier ? <TierBadge tier={member.tier} streak={member.streak} /> : t.noTier}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.activity}</div>
            <div className="text-foreground font-mono">
              {member.is_active ? t.activeLabel : t.deactivated}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">{t.portfolio}</div>
            <Link
              href={member.portfolio_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muara-ocean hover:underline truncate block font-mono"
            >
              {member.portfolio_url || t.noLink}
            </Link>
          </div>
        </div>

        {member.bio && (
          <div className="pt-4 border-t border-stroke">
            <div className="text-secondary uppercase font-mono text-xs mb-1.5">{t.toolchain}</div>
            <p className="px-frame [--px-line:#CFE2EE] text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap bg-surface-alt p-3.5">
              {member.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
