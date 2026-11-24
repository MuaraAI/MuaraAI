import React from "react";
import { redirect } from "next/navigation";
import { getMaintainerClient } from "@/lib/supabase/admin";
import { PortalHeader } from "@/components/ui/section";
import { monthLabel, monthStart, parseRules, type Division, type Standing } from "@/lib/contributions/rules";
import ContributionsTable, { type ContributionRow } from "./contributions-table";
import SyncButton from "./sync-button";

export const dynamic = "force-dynamic";

const MODE_TEXT = {
  dry_run: "Dry run: hanya mencatat, tidak ada yang diperingatkan atau dikeluarkan.",
  warn_only: "Peringatan saja: anggota diperingatkan, tidak ada yang dikeluarkan otomatis.",
  full: "Penuh: peringatan lalu kick otomatis setelah dua bulan berturut-turut.",
} as const;

export default async function AdminContributionsPage() {
  const admin = await getMaintainerClient();
  if (!admin) redirect("/dashboard");

  const month = monthStart(new Date());
  const [membersRes, statsRes, evaluationsRes, rulesRes] = await Promise.all([
    admin
      .from("members")
      .select("id, full_name, github_username, division, contribution_standing")
      .eq("registration_status", "approved")
      .eq("membership_status", "active")
      .eq("is_active", true)
      .order("full_name"),
    admin.from("monthly_contributions").select("member_id, merged_prs, external_prs, commits, new_repos, new_works").eq("month", month),
    admin.from("contribution_evaluations").select("member_id, month, met, action, enforced").order("month", { ascending: false }).limit(500),
    admin.from("community_settings").select("value").eq("key", "contribution_rules").maybeSingle(),
  ]);

  const rules = parseRules(rulesRes.data?.value);
  const statsByMember = new Map((statsRes.data ?? []).map((row) => [row.member_id as string, row]));
  const lastEvaluation = new Map<string, { month: string; met: boolean; action: string; enforced: boolean }>();
  for (const row of evaluationsRes.data ?? []) {
    if (!lastEvaluation.has(row.member_id as string)) {
      lastEvaluation.set(row.member_id as string, { month: row.month, met: row.met, action: row.action, enforced: row.enforced });
    }
  }

  const rows: ContributionRow[] = (membersRes.data ?? []).map((member) => {
    const stats = statsByMember.get(member.id);
    return {
      id: member.id,
      name: member.full_name,
      github: member.github_username ?? "",
      division: (member.division === "creative" ? "creative" : "builder") as Division,
      standing: (member.contribution_standing === "warned" ? "warned" : "good") as Standing,
      stats: stats
        ? {
            mergedPrs: stats.merged_prs,
            externalPrs: stats.external_prs,
            commits: stats.commits,
            newRepos: stats.new_repos,
            newWorks: stats.new_works,
          }
        : null,
      lastEvaluation: lastEvaluation.get(member.id) ?? null,
    };
  });

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Kontribusi Anggota">
        {`Progres bulan ${monthLabel(month)} dibanding target tiap divisi. ${MODE_TEXT[rules.enforcement]}`}
      </PortalHeader>

      <SyncButton />
      <ContributionsTable rows={rows} rules={rules} />
    </div>
  );
}
