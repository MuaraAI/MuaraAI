import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("members.bio is private", () => {
  it("the public directory does not select it", () => {
    const src = readFileSync("src/app/(public)/members/page.tsx", "utf8");
    expect(src).not.toMatch(/\bbio\b/);
  });

  it("a migration revokes the column from the public roles", () => {
    const sql = readFileSync("supabase/migrations/20261201_bio_private.sql", "utf8");
    expect(sql).toMatch(/REVOKE SELECT \(bio\) ON public\.members FROM anon, authenticated/);
  });
});
