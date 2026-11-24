import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261130_discord_sessions.sql"), "utf8");

describe("discord sessions migration", () => {
  it("creates both tables with RLS enabled", () => {
    for (const table of ["discord_sessions", "session_attendance"]) {
      expect(sql).toMatch(new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}\\b`));
      expect(sql).toMatch(new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
    }
  });

  it("limits the type and the duration with CHECK constraints", () => {
    expect(sql).toContain("CHECK (type IN ('diskusi', 'sharing', 'modul', 'aturan_github', 'random', 'lainnya'))");
    expect(sql).toContain("CHECK (ends_at > starts_at)");
  });

  it("makes the check-in code unique", () => {
    expect(sql).toMatch(/checkin_code text NOT NULL UNIQUE/);
  });

  it("grants select on the public session columns only, never checkin_code", () => {
    const revoke = sql.indexOf("REVOKE ALL ON public.discord_sessions");
    const grant = sql.match(/GRANT SELECT \(([\s\S]*?)\) ON public\.discord_sessions TO authenticated/);
    expect(revoke).toBeGreaterThan(-1);
    expect(grant).not.toBeNull();
    expect(sql.indexOf(grant![0])).toBeGreaterThan(revoke);
    const columns = grant![1].split(",").map((column) => column.trim());
    for (const column of ["id", "title", "type", "materi", "starts_at", "ends_at", "discord_url", "created_at"]) {
      expect(columns).toContain(column);
    }
    expect(columns).not.toContain("checkin_code");
  });

  it("lets members read only their own attendance and maintainers read all", () => {
    expect(sql).toContain("member_id = (SELECT auth.uid())");
    expect(sql).toContain("(SELECT public.is_maintainer())");
  });

  it("has no write policy or write grant", () => {
    expect(sql).not.toMatch(/FOR (INSERT|UPDATE|DELETE|ALL)/i);
    expect(sql).not.toMatch(/GRANT (INSERT|UPDATE|DELETE|ALL)/i);
  });

  it("has no BEGIN or COMMIT so it can be applied as a migration", () => {
    expect(sql).not.toMatch(/^\s*(BEGIN|COMMIT);/m);
  });
});
