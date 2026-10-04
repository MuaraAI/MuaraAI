export type KeyPrefixType = "muara_ai_" | "muara_ubsi_";

/**
 * Generate 32 bytes (64 hex characters) of cryptographic randomness.
 * Formatted with chosen prefix (e.g. muara_ai_<64 hex> or muara_ubsi_<64 hex>).
 */
export function generateRawKey(prefix: KeyPrefixType): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `${prefix}${hex}`;
}

/**
 * Computes lowercase SHA-256 hex string using WebCrypto API.
 */
export async function sha256Hex(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const digestBuffer = await globalThis.crypto.subtle.digest("SHA-256", encoded);
  return Array.from(new Uint8Array(digestBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Extracts preview prefix (first 14-16 chars, e.g. "muara_ai_12345" or "muara_ubsi_1234").
 */
export function keyPrefixOf(raw: string, length = 14): string {
  return raw.slice(0, length);
}
