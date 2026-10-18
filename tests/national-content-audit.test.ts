import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const publicFiles = [
  "src/components/landing/footer.tsx",
  "src/components/landing/projects-grid.tsx",
  "src/components/landing/manifesto.tsx",
  "src/components/landing/treasury-preview.tsx",
  "src/components/landing/syndicate-roster.tsx",
].map((file) => path.resolve(process.cwd(), file));

describe("national public content audit", () => {
  it("does not expose stale vendor, vault, or slogan copy", () => {
    const source = publicFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
    expect(source).not.toMatch(/Zero Slop|100% Independent|AES-256-GCM Vault|Tencent|Vault Active/i);
  });

  it("contains the official social/contact destinations", () => {
    const footer = fs.readFileSync(publicFiles[0], "utf8");
    expect(footer).toContain("https://x.com/MuaraAI");
    expect(footer).toContain("https://www.instagram.com/muara.ai/");
    expect(footer).toContain("https://www.threads.com/@muara.ai");
    expect(footer).toContain("mailto:admin@muaraai.com");
  });
});
