import { describe, it, expect } from "vitest";
import { generateRawKey, sha256Hex, keyPrefixOf } from "../src/lib/keys";

describe("Vault & API Key Generator", () => {
  it("generates raw keys with correct prefixes and length", () => {
    const aiKey = generateRawKey("muara_ai_");
    expect(aiKey.startsWith("muara_ai_")).toBe(true);
    expect(aiKey.length).toBe(9 + 64); // "muara_ai_" (9) + 64 hex = 73

    const ubsiKey = generateRawKey("muara_ubsi_");
    expect(ubsiKey.startsWith("muara_ubsi_")).toBe(true);
    expect(ubsiKey.length).toBe(11 + 64); // "muara_ubsi_" (11) + 64 hex = 75
  });

  it("computes valid sha256 hex hashes", async () => {
    const raw = "muara_ai_test123";
    const hash = await sha256Hex(raw);
    expect(hash.length).toBe(64);
    expect(/^[0-9a-f]{64}$/.test(hash)).toBe(true);
  });

  it("extracts clean prefix previews", () => {
    const raw = "muara_ai_1234567890abcdef";
    const prefix = keyPrefixOf(raw);
    expect(prefix).toBe("muara_ai_12345");
  });
});
