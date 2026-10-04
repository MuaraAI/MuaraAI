import { describe, it, expect } from "vitest";
import { generateRawKey, sha256Hex, keyPrefixOf } from "../src/lib/keys";
import { encryptVaultCredential, decryptVaultCredential } from "../src/lib/vault-crypto";

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

  it("encrypts and decrypts campus credentials matching Python AES-256-GCM format", () => {
    const secretKey = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"; // 64 hex
    const plainText = "RahasiaKampus123!@#";

    const encrypted = encryptVaultCredential(plainText, secretKey);
    expect(encrypted.includes(".")).toBe(true);
    const [ivB64, ctB64] = encrypted.split(".");
    expect(ivB64.length).toBeGreaterThan(10);
    expect(ctB64.length).toBeGreaterThan(16);

    const decrypted = decryptVaultCredential(encrypted, secretKey);
    expect(decrypted).toBe(plainText);
  });
});
