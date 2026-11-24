import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sql = fs.readFileSync(
  path.resolve(__dirname, "../supabase/migrations/20261128_contribution_engine.sql"),
  "utf8"
);

describe("contribution engine migration", () => {
  it("creates the three server-only tables with RLS and read-only policies", () => {
    for (const table of ["org_repos", "monthly_contributions", "contribution_evaluations"]) {
      expect(sql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`));
      expect(sql).toMatch(new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
    }
    expect(sql).toContain("member_id = (SELECT auth.uid())");
    expect(sql).toContain("(SELECT public.is_maintainer())");
    expect(sql).not.toMatch(/FOR (INSERT|UPDATE|DELETE|ALL)/i);
    expect(sql).not.toMatch(/GRANT (INSERT|UPDATE|DELETE|ALL)/i);
  });

  it("adds the member standing column and seeds the default rules in dry-run mode", () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS contribution_standing text NOT NULL DEFAULT 'good'/);
    expect(sql).toContain("CHECK (contribution_standing IN ('good', 'warned'))");
    const match = sql.match(/'contribution_rules',\s*'(\{.*?\})'::jsonb/s);
    expect(match).not.toBeNull();
    const rules = JSON.parse(match![1]);
    expect(rules.enforcement).toBe("dry_run");
    expect(rules.builder).toEqual({ merged_prs: 10, external_prs: 5, commits: 50, new_repos: 1 });
    expect(rules.creative).toEqual({ merged_prs: 10, external_prs: 5, new_works: 1 });
    expect(rules.new_work_label).toBe("karya-baru");
  });

  it("lets service-role updates through the privileged-columns trigger but protects the new columns", () => {
    const fn = sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns"));
    expect(fn).toContain("auth.uid() IS NOT NULL AND NOT public.is_maintainer()");
    for (const clause of [
      "OLD.hierarchy IS DISTINCT FROM NEW.hierarchy",
      "OLD.roles IS DISTINCT FROM NEW.roles",
      "OLD.registration_status IS DISTINCT FROM NEW.registration_status",
      "OLD.is_active IS DISTINCT FROM NEW.is_active",
      "OLD.titles IS DISTINCT FROM NEW.titles",
      "OLD.role_title IS DISTINCT FROM NEW.role_title",
      "OLD.total_commits IS DISTINCT FROM NEW.total_commits",
      "OLD.contribution_standing IS DISTINCT FROM NEW.contribution_standing",
    ]) {
      expect(fn).toContain(clause);
    }
  });
});
