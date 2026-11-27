import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PRIVATE_MEMBER_COLUMNS } from "../src/lib/members-privacy";

const root = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

const MEMBERS_SELECT = /\.from\("members"\)\s*\.select\(\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`)/g;

function readsPrivateColumns(source: string): boolean {
  for (const match of source.matchAll(MEMBERS_SELECT)) {
    const columns = (match[1] ?? match[2] ?? match[3] ?? "").trim();
    if (columns === "*") return true;
    const list = columns.split(",").map((column) => column.trim());
    if (list.some((column) => (PRIVATE_MEMBER_COLUMNS as readonly string[]).includes(column))) return true;
  }
  return false;
}

describe("members privacy", () => {
  it("only reads private member columns or * through the privileged client", () => {
    const offenders = sourceFiles(path.join(root, "src")).filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      return readsPrivateColumns(source) && !source.includes("@/lib/supabase/admin");
    });
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });

  it("never imports the privileged client from a client component", () => {
    const offenders = sourceFiles(path.join(root, "src")).filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      return /^\s*["']use client["']/.test(source) && source.includes("@/lib/supabase/admin");
    });
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });

  it("lists the expected private columns", () => {
    for (const column of ["email", "phone_wa", "telegram_username", "join_reason", "rejection_reason"]) {
      expect(PRIVATE_MEMBER_COLUMNS).toContain(column);
    }
  });

  describe("privacy migration", () => {
    const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261126_members_privacy.sql"), "utf8");

    it("replaces the public-read policy with an approved-or-own-or-maintainer rule", () => {
      expect(sql).toContain('DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.members');
      expect(sql).toMatch(/registration_status = 'approved'/);
      expect(sql).toMatch(/membership_status = 'active'/);
      expect(sql).toMatch(/id = \(SELECT auth\.uid\(\)\)|id = auth\.uid\(\)/);
      expect(sql).toContain("(SELECT public.is_maintainer())");
    });

    it("revokes table-wide SELECT and grants only non-private columns", () => {
      expect(sql).toContain("REVOKE SELECT ON public.members FROM anon, authenticated");
      const grant = sql.match(/GRANT SELECT \(([\s\S]*?)\) ON public\.members TO anon, authenticated/);
      expect(grant).not.toBeNull();
      const granted = grant![1].split(",").map((column) => column.trim());
      for (const column of PRIVATE_MEMBER_COLUMNS) expect(granted).not.toContain(column);
      for (const column of ["id", "full_name", "github_username", "division", "track", "campus", "affiliation", "registration_status", "is_active"]) {
        expect(granted).toContain(column);
      }
    });
  });
});
