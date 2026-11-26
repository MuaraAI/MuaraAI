import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");

describe("portal and login stay calm (MOTION 1)", () => {
  it("has no endless pulse on status dots", () => {
    for (const file of ["src/components/portal/member-shell.tsx", "src/app/(portal)/dashboard/page.tsx"]) {
      expect(read(file)).not.toContain("animate-pulse");
    }
  });

  it("highlights the active menu item statically instead of sliding a shared layout element", () => {
    for (const file of ["src/components/portal/member-shell.tsx", "src/components/portal/admin-shell.tsx"]) {
      const source = read(file);
      expect(source).not.toContain("layoutId");
      expect(source).not.toContain("motion/react");
    }
  });

  it("login has no typing effect or staggered entrance, and does not assume the old 72px header", () => {
    const source = read("src/app/(public)/login/page.tsx");
    expect(source).not.toContain("TypeText");
    expect(source).not.toContain("FadeIn");
    expect(source).not.toContain("72px");
  });
});
