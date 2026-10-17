import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

describe("Membership security boundaries", () => {
  it("uses the trusted database RPC for exit mutations", () => {
    const source = fs.readFileSync(
      path.resolve(__dirname, "../src/app/actions/membership.ts"),
      "utf-8"
    );
    expect(source).toContain('rpc("request_membership_exit"');
    expect(source).not.toContain('.from("ai_api_keys")');
    expect(source).not.toContain('.from("api_keys")');
  });

  it("keeps the exit status route outside the portal layout", () => {
    expect(fs.existsSync(path.resolve(__dirname, "../src/app/(public)/membership-exit/page.tsx"))).toBe(true);
    expect(fs.existsSync(path.resolve(__dirname, "../src/app/(portal)/membership-exit/page.tsx"))).toBe(false);
  });
});
