import crypto from "node:crypto";

/**
 * Parse a 32-byte encryption key from either a 64-char hex string or 32-byte string.
 */
function parseKey(keyInput: string): Buffer {
  if (keyInput.length === 64) {
    try {
      const buf = Buffer.from(keyInput, "hex");
      if (buf.length === 32) return buf;
    } catch {
      // Fall through
    }
  }
  const utf8Buf = Buffer.from(keyInput, "utf-8");
  if (utf8Buf.length === 32) return utf8Buf;
  throw new Error("VAULT_ENCRYPTION_KEY must be exactly 32 bytes (or 64-character hex)");
}

/**
 * Encrypt a plaintext credential using AES-256-GCM.
 * Output format matches Python UBSI-API app/vault.py:
 * `{base64url(iv)}.{base64url(ciphertext_with_tag)}`
 */
export function encryptVaultCredential(plainText: string, keyInput: string): string {
  const keyBytes = parseKey(keyInput);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", keyBytes, iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  const ciphertextWithTag = Buffer.concat([encrypted, tag]);

  const ivB64 = iv.toString("base64url");
  const ctB64 = ciphertextWithTag.toString("base64url");
  return `${ivB64}.${ctB64}`;
}

/**
 * Decrypt a credential formatted as `{base64url(iv)}.{base64url(ciphertext_with_tag)}`.
 */
export function decryptVaultCredential(cipherStr: string, keyInput: string): string {
  const keyBytes = parseKey(keyInput);
  const parts = cipherStr.split(".");
  if (parts.length !== 2) {
    throw new Error("Invalid ciphertext format: expected {iv}.{ciphertext}");
  }

  const iv = Buffer.from(parts[0], "base64url");
  const ctWithTag = Buffer.from(parts[1], "base64url");
  if (ctWithTag.length < 16) {
    throw new Error("Ciphertext too short: missing auth tag");
  }

  const tag = ctWithTag.subarray(ctWithTag.length - 16);
  const ciphertext = ctWithTag.subarray(0, ctWithTag.length - 16);

  const decipher = crypto.createDecipheriv("aes-256-gcm", keyBytes, iv);
  decipher.setAuthTag(tag);

  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}
