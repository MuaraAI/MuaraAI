import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const read = (file: string) => fs.readFileSync(path.resolve(__dirname, "..", file), "utf8");

describe("claims the community cannot back up", () => {
  it("does not promise subsidized compute, shared API keys or shared cloud infrastructure", () => {
    for (const file of ["src/components/landing/benefits-grid.tsx", "src/components/landing/manifesto.tsx"]) {
      const source = read(file);
      expect(source).not.toMatch(/subsidi kuota compute/i);
      expect(source).not.toMatch(/shared compute/i);
      expect(source).not.toMatch(/shared cloud infrastructure/i);
    }
  });
});
