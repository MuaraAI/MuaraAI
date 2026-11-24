import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sql = fs.readFileSync(path.resolve(__dirname, "../supabase/migrations/20261129_member_tiers.sql"), "utf8");

describe("member tiers migration", () => {
  it("adds tier and streak with CHECK constraints and zero defaults", () => {
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS tier smallint NOT NULL DEFAULT 0/);
    expect(sql).toMatch(/ADD COLUMN IF NOT EXISTS streak integer NOT NULL DEFAULT 0/);
    expect(sql).toContain("CHECK (tier BETWEEN 0 AND 4)");
    expect(sql).toContain("CHECK (streak >= 0)");
  });

  it("grants public select on exactly tier and streak without touching private columns", () => {
    expect(sql).toMatch(/GRANT SELECT \(tier, streak\) ON public\.members TO anon, authenticated/);
    expect(sql).not.toMatch(/GRANT SELECT \([^)]*(email|phone_wa|join_reason|contribution_standing)/);
  });

  it("protects both columns against self-edits while keeping the service-role bypass", () => {
    const fn = sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns"));
    expect(fn).toContain("COALESCE(auth.role(), '') IN ('anon', 'authenticated') AND NOT public.is_maintainer()");
    expect(fn).toContain("OLD.tier IS DISTINCT FROM NEW.tier");
    expect(fn).toContain("OLD.streak IS DISTINCT FROM NEW.streak");
    expect(fn).toContain("OLD.contribution_standing IS DISTINCT FROM NEW.contribution_standing");
  });

  it("forces tier and streak to zero on insert for ordinary signed-in users", () => {
    const fn = sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION public.harden_member_insert"));
    expect(fn).toContain("NEW.tier := 0");
    expect(fn).toContain("NEW.streak := 0");
    expect(fn).toContain("NEW.total_commits := 0");
  });

  it("has no BEGIN or COMMIT so it can be applied as a migration", () => {
    expect(sql).not.toMatch(/^\s*(BEGIN|COMMIT);/m);
  });
});
