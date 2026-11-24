import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sql = fs.readFileSync(
  path.resolve(__dirname, "../supabase/migrations/20261127_members_write_hardening.sql"),
  "utf8"
);

describe("members write hardening migration", () => {
  it("adds a BEFORE INSERT trigger that forces safe values for ordinary signed-in users", () => {
    expect(sql).toMatch(/CREATE TRIGGER trg_harden_member_insert\s+BEFORE INSERT ON public\.members/);
    expect(sql).toContain("IF auth.uid() IS NULL OR public.is_maintainer() THEN");
    for (const forced of [
      "NEW.hierarchy := 'member'",
      "NEW.roles := '{}'",
      "NEW.titles := '{}'",
      "NEW.registration_status := 'pending'",
      "NEW.membership_status := 'active'",
      "NEW.reapply_blocked := false",
      "NEW.total_commits := 0",
      "NEW.reviewed_by := NULL",
    ]) {
      expect(sql).toContain(forced);
    }
  });

  it("also guards titles and role_title on update without bringing back dues", () => {
    const fn = sql.slice(sql.indexOf("CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns"));
    for (const clause of [
      "OLD.hierarchy IS DISTINCT FROM NEW.hierarchy",
      "OLD.roles IS DISTINCT FROM NEW.roles",
      "OLD.registration_status IS DISTINCT FROM NEW.registration_status",
      "OLD.is_active IS DISTINCT FROM NEW.is_active",
      "OLD.titles IS DISTINCT FROM NEW.titles",
      "OLD.role_title IS DISTINCT FROM NEW.role_title",
    ]) {
      expect(fn).toContain(clause);
    }
    expect(fn).not.toContain("dues_valid_until");
  });

  it("keeps the new trigger function off the public RPC surface", () => {
    expect(sql).toContain("REVOKE EXECUTE ON FUNCTION public.harden_member_insert() FROM PUBLIC, anon, authenticated");
  });
});
