import type { PrivilegedClient } from "@/lib/supabase/admin";
import { notifyMaintainers } from "@/lib/notify";
import type { EngineDeps, EngineMember } from "./engine";
import { renderKickEmail, renderWarningEmail, sendContributionEmail } from "./emails";
import { fetchMergedPrs, fetchOrgReposCreatedInMonth, fetchRepoCreator, type GithubDeps } from "./github";
import { DEFAULT_RULES, parseRules, type ContributionRules } from "./rules";

const fail = (what: string): never => {
  // Never include provider messages: they can contain row data.
  throw new Error(`Supabase ${what} failed`);
};

/** Wires the engine to Supabase. The client must be the service-role client: it bypasses RLS. */
export function buildSupabaseDeps(client: PrivilegedClient, github: GithubDeps): EngineDeps {
  let rules: ContributionRules = DEFAULT_RULES;

  return {
    now: () => new Date(),

    async loadRules() {
      const { data } = await client.from("community_settings").select("value").eq("key", "contribution_rules").maybeSingle();
      rules = parseRules(data?.value);
      return rules;
    },

    async loadMembers() {
      const { data, error } = await client
        .from("members")
        .select("id, github_username, full_name, email, division, membership_started_at, contribution_standing")
        .eq("registration_status", "approved")
        .eq("membership_status", "active")
        .eq("is_active", true);
      if (error) fail("loading members");
      return (data ?? []).map(
        (row): EngineMember => ({
          id: row.id,
          githubUsername: row.github_username ?? "",
          fullName: row.full_name ?? "",
          email: row.email ?? null,
          division: row.division === "creative" ? "creative" : "builder",
          membershipStartedAt: row.membership_started_at ?? null,
          standing: row.contribution_standing === "warned" ? "warned" : "good",
        })
      );
    },

    async loadRepoCreator(repo) {
      const { data } = await client.from("org_repos").select("creator_login, repo_created_at").eq("name", repo).maybeSingle();
      return data ? { creator: data.creator_login ?? null, createdAt: data.repo_created_at ?? null } : null;
    },

    async saveRepoCreator(repo, creator, createdAt) {
      const { error } = await client
        .from("org_repos")
        .upsert({ name: repo, creator_login: creator, repo_created_at: createdAt, checked_at: new Date().toISOString() }, { onConflict: "name" });
      if (error) fail("saving a repo creator");
    },

    fetchPrs: (login, month, org) => fetchMergedPrs(login, month, org, github),
    fetchRepoCreator: (repo, org) => fetchRepoCreator(repo, org, github),
    fetchOrgReposCreatedInMonth: (org, month) => fetchOrgReposCreatedInMonth(org, month, github),

    async saveStats(memberId, month, stats) {
      const { error } = await client.from("monthly_contributions").upsert(
        {
          member_id: memberId,
          month,
          merged_prs: stats.mergedPrs,
          external_prs: stats.externalPrs,
          commits: stats.commits,
          new_repos: stats.newRepos,
          new_works: stats.newWorks,
          synced_at: new Date().toISOString(),
        },
        { onConflict: "member_id,month" }
      );
      if (error) fail("saving monthly stats");
    },

    async hasEvaluation(memberId, month) {
      const { data } = await client
        .from("contribution_evaluations")
        .select("member_id")
        .eq("member_id", memberId)
        .eq("month", month)
        .maybeSingle();
      return Boolean(data);
    },

    async saveEvaluation(row) {
      const { error } = await client.from("contribution_evaluations").upsert(
        {
          member_id: row.memberId,
          month: row.month,
          met: row.met,
          action: row.action,
          enforced: row.enforced,
          evaluated_at: new Date().toISOString(),
        },
        { onConflict: "member_id,month", ignoreDuplicates: true }
      );
      if (error) fail("saving an evaluation");
    },

    async setStanding(memberId, standing) {
      const { error } = await client
        .from("members")
        .update({ contribution_standing: standing, updated_at: new Date().toISOString() })
        .eq("id", memberId);
      if (error) fail("updating a standing");
    },

    async kickMember(memberId, reason) {
      const now = new Date().toISOString();
      const { error } = await client
        .from("members")
        .update({ membership_status: "exited", is_active: false, exited_at: now, exit_reason: reason, updated_at: now })
        .eq("id", memberId);
      if (error) fail("closing a membership");
    },

    async sendWarning(member, month, stats) {
      if (!member.email) return;
      await sendContributionEmail(member.email, renderWarningEmail({ name: member.fullName, month, stats, division: member.division, rules }));
    },

    async sendKick(member, month) {
      if (!member.email) return;
      await sendContributionEmail(member.email, renderKickEmail({ name: member.fullName, month }));
    },

    async alertMaintainers(title, text) {
      await notifyMaintainers(title, text);
    },
  };
}
