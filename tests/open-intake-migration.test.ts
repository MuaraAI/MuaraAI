import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const sql = fs.readFileSync(
  path.resolve(__dirname, "../supabase/migrations/20261125_open_intake_positions.sql"),
  "utf8"
);

describe("open intake migration", () => {
  it("adds the new member columns, seeds positions, and opens the intake policy", () => {
    for (const column of ["affiliation", "join_reason", "secondary_division", "secondary_track", "telegram_username"]) {
      expect(sql).toMatch(new RegExp(`ADD COLUMN IF NOT EXISTS ${column}\\b`));
    }
    expect(sql).toContain("'positions'");
    expect(sql).toContain("global-open-v1");
    expect(sql).toContain("- 'allowed_cohort'");
  });

  it("seeds exactly the agreed positions", () => {
    const match = sql.match(/'(\{"builder":.*?\})'::jsonb/s);
    expect(match).not.toBeNull();
    const seed = JSON.parse(match![1]);
    expect(seed.builder).toEqual(["App", "Web", "Frontend", "Backend", "Automation", "Game", "Modding"]);
    expect(seed.creative).toEqual(["Social Media", "Image", "Video", "Copywriting", "Humanizer", "Idea"]);
  });
});
