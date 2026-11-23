import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function sourceFiles(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });
}

describe("legacy billing removal", () => {
  it("has no pakasir, dues, or treasury references left in src", () => {
    const offenders = sourceFiles(path.join(root, "src")).filter((file) =>
      /pakasir|dues_valid_until|treasury_transactions|DUES_|ARREARS_/i.test(fs.readFileSync(file, "utf8"))
    );
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
  });

  it("does not claim mandatory dues or arrears in terms and admin copy", () => {
    const files = [
      "src/app/(public)/terms/page.tsx",
      "src/app/(public)/login/page.tsx",
      "src/app/(portal)/admin/members/page.tsx",
    ];
    const offenders = files.filter((file) =>
      /iuran|menunggak|tunggakan/i.test(fs.readFileSync(path.join(root, file), "utf8"))
    );
    expect(offenders).toEqual([]);
  });

  it("recreates the members privileged-columns trigger function before dropping dues_valid_until", () => {
    const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261123_remove_dues_treasury.sql"), "utf8");
    const fn = sql.indexOf("CREATE OR REPLACE FUNCTION public.protect_member_privileged_columns");
    const drop = sql.indexOf("DROP COLUMN IF EXISTS dues_valid_until");
    expect(fn).toBeGreaterThan(-1);
    expect(drop).toBeGreaterThan(fn);
    const body = sql.slice(fn, sql.indexOf("$$;", fn));
    expect(body).not.toMatch(/dues_valid_until/);
    expect(body).toMatch(/is_maintainer\(\)/);
  });

  it("has no pakasir env vars in .env.example", () => {
    expect(fs.readFileSync(path.join(root, ".env.example"), "utf8")).not.toMatch(/pakasir/i);
  });

  it("has no mail center remnants (inbox_messages, sent_emails, contact action) in src", () => {
    const offenders = sourceFiles(path.join(root, "src")).filter((file) =>
      /inbox_messages|sent_emails|InboxMessage|SentEmail|submitContactMessage/.test(fs.readFileSync(file, "utf8"))
    );
    expect(offenders.map((f) => path.relative(root, f))).toEqual([]);
    expect(fs.existsSync(path.join(root, "src/app/actions/contact.ts"))).toBe(false);
  });

  it("has no pakasir webhook route", () => {
    expect(fs.existsSync(path.join(root, "src/app/api/webhooks/pakasir/route.ts"))).toBe(false);
  });
});
