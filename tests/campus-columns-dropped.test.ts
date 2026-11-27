import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { PRIVATE_MEMBER_COLUMNS } from "../src/lib/members-privacy";

const root = path.resolve(__dirname, "..");
const DROPPED = ["nim", "prodi", "kelas", "semester", "angkatan", "generation", "city", "toolchain_narrative"];

const walk = (dir: string): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(entry.name) ? [full] : [];
  });

describe("campus-era member columns", () => {
  it("are dropped by one migration, and only those", () => {
    const sql = fs.readFileSync(path.join(root, "supabase/migrations/20261203_drop_campus_era_columns.sql"), "utf8");
    const dropped = [...sql.matchAll(/DROP COLUMN IF EXISTS (\w+)/g)].map((match) => match[1]);
    expect(dropped.sort()).toEqual([...DROPPED].sort());
    // The institution and the status stay: they are what the community still asks for.
    expect(sql).not.toMatch(/DROP COLUMN[^\n]*\b(campus|affiliation)\b/);
  });

  it("are no longer read, written or listed anywhere in the app", () => {
    const offenders = walk(path.join(root, "src")).filter((file) => {
      const source = fs.readFileSync(file, "utf8");
      return DROPPED.some((column) => new RegExp(`\\b${column}\\b`).test(source));
    });
    expect(offenders.map((file) => path.relative(root, file))).toEqual([]);
  });

  it("are not in the list of private columns any more", () => {
    for (const column of DROPPED) expect(PRIVATE_MEMBER_COLUMNS).not.toContain(column);
  });
});
