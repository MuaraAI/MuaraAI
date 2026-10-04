import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Portal Contrast Sanitization", () => {
  const portalFiles = [
    "src/app/(portal)/dashboard/page.tsx",
    "src/app/(portal)/dashboard/treasury/page.tsx",
    "src/app/(portal)/dashboard/learn/learn-feed-client.tsx",
    "src/app/(portal)/admin/treasury/page.tsx",
    "src/app/(portal)/admin/members/page.tsx",
  ];

  it("ensures portal files do not render text-white on light card backgrounds", () => {
    portalFiles.forEach((file) => {
      const fullPath = path.resolve(__dirname, "..", file);
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf-8");
        // Must not contain text-white directly on heading or body inside white cards
        const matches = content.match(/className="[^"]*text-white[^"]*"/g) || [];
        // Filter out false positives (buttons with dark backgrounds are allowed text-white)
        const invalidMatches = matches.filter(
          (m) =>
            !m.includes("bg-muara-ocean") &&
            !m.includes("bg-foreground") &&
            !m.includes("bg-primary") &&
            !m.includes("bg-emerald-") &&
            !m.includes("bg-rose-") &&
            !m.includes("bg-red-")
        );
        expect(invalidMatches.length, `Found invalid text-white in ${file}: ${invalidMatches.join(", ")}`).toBe(0);
      }
    });
  });
});
