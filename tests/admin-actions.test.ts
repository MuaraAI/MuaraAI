import { describe, it, expect } from "vitest";
import { isMaintainer } from "../src/lib/guards";

describe("Maintainer Role Guard", () => {
  it("authorizes user with maintainer hierarchy or in roles array", () => {
    expect(isMaintainer({ hierarchy: "maintainer", roles: [] })).toBe(true);
    expect(isMaintainer({ hierarchy: "member", roles: ["maintainer"] })).toBe(true);
    expect(isMaintainer({ hierarchy: "member", roles: ["head-builder"] })).toBe(false);
  });
});
