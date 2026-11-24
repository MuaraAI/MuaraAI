"use server";

import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { isMaintainer } from "@/lib/guards";
import { escapeHtml } from "@/lib/notify";
import { fetchMemberOrgCommits } from "@/lib/github-sync";
import { POSITIONS_SETTING_KEY, normalizePositions, type PositionsConfig } from "@/lib/positions";
import { isValidTierMultipliers, serializeRules, type ContributionRules } from "@/lib/contributions/rules";
import { runContributionSync } from "@/lib/contributions/engine";
import { buildSupabaseDeps } from "@/lib/contributions/supabase-deps";
import { Resend } from "resend";

async function assertMaintainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("id, hierarchy, roles")
    .eq("id", user.id)
    .single();

  if (!isMaintainer(member)) {
    throw new Error("Forbidden: Maintainer access required");
  }

  return { supabase, user };
}

// Never surface raw DB/provider error strings to the client; log details server-side.
const GENERIC_ERROR = "Terjadi kesalahan pada server. Silakan coba lagi.";

// 1. Approve applicant & invite to GitHub Org
export async function approveApplicant(memberId: string) {
  const { supabase, user } = await assertMaintainer();

  // email is a private column: read it with the service-role client (caller already verified as maintainer).
  const privileged = await createPrivilegedClient();
  const { data: member, error: fetchErr } = await privileged
    .from("members")
    .select("id, github_username, email, full_name, registration_status, membership_status, reapply_blocked, membership_started_at")
    .eq("id", memberId)
    .single();

  if (fetchErr || !member) {
    return { success: false, error: "Member not found" };
  }

  if (member.reapply_blocked || member.membership_status === "exited") {
    return { success: false, error: "Member ini sudah pernah keluar dan tidak dapat di-approve ulang." };
  }

  if (member.registration_status !== "pending") {
    return { success: false, error: "Pendaftar ini tidak lagi berada dalam status pending." };
  }

  // Update DB status to approved without resetting the original start date
  const { error: updateErr } = await supabase
    .from("members")
    .update({
      registration_status: "approved",
      membership_status: "active",
      is_active: true,
      membership_started_at: member.membership_started_at ?? new Date().toISOString(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (updateErr) {
    console.error("[admin:approveApplicant]", updateErr.message);
    return { success: false, error: GENERIC_ERROR };
  }

  // Auto invite to GitHub Organization via API
  const ghToken = process.env.GITHUB_ORG_TOKEN;
  if (ghToken && member.github_username) {
    try {
      await fetch(
        `https://api.github.com/orgs/MuaraAI/memberships/${member.github_username}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MuaraAI-Web-Portal",
          },
          body: JSON.stringify({ role: "member" }),
        }
      );
    } catch (e) {
      console.error("GitHub Org invite failed:", e);
    }
  }

  // Send congratulations email via Resend if email exists
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && member.email) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Muara AI <admin@muaraai.com>",
        to: member.email,
        subject: "Kamu resmi bagian dari MuaraAI",
        html: `<p>Halo ${escapeHtml(member.full_name ?? "")},</p><p>Karya kamu sudah kami review dan kami senang kamu bergabung. Tiga langkah awalnya:</p><ol><li>Terima undangan GitHub org MuaraAI (cek email atau notifikasi GitHub @${escapeHtml(member.github_username ?? "")}).</li><li>Buka dashboard: <a href="https://muaraai.com/dashboard">muaraai.com/dashboard</a></li><li>Pilih repo yang sudah ada, bikin branch baru, lalu buka Pull Request pertamamu.</li></ol><p>Semua kontribusi lewat PR dan direview anggota lain. Kalau bingung mulai dari mana, tanya saja di sesi Discord mingguan.</p><p>Salam,<br/>Tim MuaraAI</p>`,
      });
    } catch (e) {
      console.error("Resend email failed:", e);
    }
  }

  return { success: true };
}

// 2. Reject applicant
export async function rejectApplicant(memberId: string, reason?: string) {
  const { supabase, user } = await assertMaintainer();

  const cleanedReason = reason?.trim() || "Berkas Proof of Work belum memenuhi kriteria komunitas.";

  const { error } = await supabase
    .from("members")
    .update({
      registration_status: "rejected",
      rejection_reason: cleanedReason,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) {
    console.error("[admin:rejectApplicant]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

// 4. Publish Material
export async function publishMaterial(data: {
  title: string;
  description: string;
  resourceUrl: string;
  coverUrl?: string;
  division: string;
}) {
  const { supabase, user } = await assertMaintainer();

  const { error } = await supabase.from("learning_materials").insert({
    title: data.title,
    description: data.description,
    resource_url: data.resourceUrl,
    cover_url: data.coverUrl || null,
    division: data.division,
    created_by: user.id,
  });

  if (error) {
    console.error("[admin:publishMaterial]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

// 6. Create Achievement
export async function addAchievement(data: {
  title: string;
  issuer: string;
  issueDate: string;
  imageUrl: string;
  credentialUrl?: string;
  recipientNames: string[];
}) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase.from("achievements").insert({
    title: data.title,
    issuer: data.issuer,
    issue_date: data.issueDate,
    image_url: data.imageUrl,
    credential_url: data.credentialUrl || null,
    recipient_names: data.recipientNames,
  });

  if (error) {
    console.error("[admin:addAchievement]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

// 7. Toggle Member Status (Blacklist)
export async function toggleMemberActive(memberId: string, isActive: boolean) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase
    .from("members")
    .update({ is_active: isActive })
    .eq("id", memberId);

  if (error) {
    console.error("[admin:toggleMemberActive]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

// 9. Update the official positions per division (does not touch existing members)
export async function updatePositions(data: PositionsConfig) {
  const { supabase } = await assertMaintainer();

  const normalized = normalizePositions(data);
  if (!normalized) {
    return { success: false, error: "Setiap divisi harus punya minimal satu posisi." };
  }

  const { error } = await supabase.from("community_settings").upsert(
    {
      key: POSITIONS_SETTING_KEY,
      value: normalized,
      description: "Official positions per division (editable by maintainers)",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error("[admin:updatePositions]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

const RULE_LIMIT = 1000;
const isRuleCount = (value: unknown) => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= RULE_LIMIT;

function validateContributionRules(data: ContributionRules): string | null {
  if (!data || !["dry_run", "warn_only", "full"].includes(data.enforcement)) return "Mode penegakan tidak valid.";
  if (typeof data.org !== "string" || !/^[A-Za-z0-9-]{1,39}$/.test(data.org)) return "Nama org tidak valid.";
  if (typeof data.newWorkLabel !== "string" || !/^[A-Za-z0-9 _-]{1,50}$/.test(data.newWorkLabel.trim())) return "Label karya tidak valid.";
  const numbers = [
    data.builder?.mergedPrs,
    data.builder?.externalPrs,
    data.builder?.commits,
    data.builder?.newRepos,
    data.creative?.mergedPrs,
    data.creative?.externalPrs,
    data.creative?.newWorks,
  ];
  if (!numbers.every(isRuleCount)) return `Nilai target harus bilangan bulat 0–${RULE_LIMIT}.`;
  return isValidTierMultipliers(data.tierMultipliers) ? null : "Pengali tier harus naik berurutan (lebih dari 1, maksimal 10).";
}

// 9b. Update the monthly contribution quota and enforcement mode
export async function updateContributionRules(data: ContributionRules) {
  const { supabase } = await assertMaintainer();

  const problem = validateContributionRules(data);
  if (problem) return { success: false, error: problem };

  const { error } = await supabase.from("community_settings").upsert(
    {
      key: "contribution_rules",
      value: serializeRules({ ...data, newWorkLabel: data.newWorkLabel.trim() }),
      description: "Monthly contribution quota and enforcement mode (editable by maintainers)",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" }
  );

  if (error) {
    console.error("[admin:updateContributionRules]", error.message);
    return { success: false, error: GENERIC_ERROR };
  }
  return { success: true };
}

// 9c. Refresh contribution statistics now. Never evaluates, warns, or removes anyone.
export async function syncContributionsNow() {
  await assertMaintainer();

  try {
    const client = await createPrivilegedClient();
    const summary = await runContributionSync(buildSupabaseDeps(client, { token: process.env.GITHUB_ORG_TOKEN }), { evaluate: false });
    return { success: true, summary: { synced: summary.synced, skipped: summary.skipped } };
  } catch (error) {
    console.error("[admin:syncContributionsNow]", error instanceof Error ? error.message : "unknown error");
    return { success: false, error: GENERIC_ERROR };
  }
}

// 8. Synchronize GitHub commits across all repos in org:MuaraAI
export async function syncOrgCommits() {
  const { supabase } = await assertMaintainer();

  const { data: members, error } = await supabase
    .from("members")
    .select("id, github_username, total_commits")
    .eq("registration_status", "approved");

  if (error || !members) {
    return { success: false, error: error?.message || "Gagal memuat anggota." };
  }

  const updated: { id: string; username: string; commits: number }[] = [];

  for (const m of members) {
    if (!m.github_username) continue;
    const count = await fetchMemberOrgCommits(m.github_username);
    await supabase
      .from("members")
      .update({ total_commits: count, updated_at: new Date().toISOString() })
      .eq("id", m.id);
    updated.push({ id: m.id, username: m.github_username, commits: count });
  }

  return { success: true, count: updated.length, updated };
}
