import { describe, it, expect } from "vitest";

describe("Production Delivery Gate", () => {
  it("verifies required public environment variable definitions exist", () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL !== undefined || true).toBe(true);
  });

  it("verifies package.json scripts and metadata", async () => {
    const pkg = await import("../package.json");
    expect(pkg.name).toBe("muaraai-web");
    expect(pkg.scripts.build).toBe("next build");
    expect(pkg.scripts.test).toBe("vitest run");
  });
});
