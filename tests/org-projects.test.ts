import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");

function sources(dir: string): string[] {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sources(full);
    return /\.(ts|tsx|css)$/.test(entry.name) ? [full] : [];
  });
}

// Checked against the GitHub org and the live sites on 2026-11-26: these were renamed or no longer exist.
const DEAD = ["muara-arus-1", "Muara Arus", "ubsi-api.muaraai.com", "MuaraAI/UBSI-API", "ollama.com/MuaraAI"];

describe("project links match what exists in the org", () => {
  it("does not link to repos, models or hosts that were renamed or removed", () => {
    const files = [...sources(path.join(root, "src")), path.join(root, "README.md")];
    const offenders = files.flatMap((file) => {
      const text = fs.readFileSync(file, "utf8");
      return DEAD.filter((needle) => text.includes(needle)).map((needle) => `${path.relative(root, file)}: ${needle}`);
    });
    expect(offenders).toEqual([]);
  });
});
