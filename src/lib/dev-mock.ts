import path from "node:path";

/**
 * Local dummy-data mode. Active only under `next dev` with MUARA_DEV_MOCK=1 in .env.local AND a local
 * `dev-mock/` folder (gitignored). Production builds never take this path: NODE_ENV is inlined as
 * "production", so every check below is false and the loader is never called.
 */
export const DEV_MOCK_COOKIE = "muara_dev_user";
export type DevRole = "admin" | "member";

interface DevMockModule {
  createMockClient(options: { getCookie: (name: string) => string | undefined }): unknown;
}

declare const __non_webpack_require__: NodeRequire | undefined;

let cached: DevMockModule | null | undefined;

export function isDevMockEnabled(): boolean {
  return process.env.NODE_ENV === "development" && process.env.MUARA_DEV_MOCK === "1" && loadDevMock() !== null;
}

export function loadDevMock(): DevMockModule | null {
  if (process.env.NODE_ENV !== "development" || process.env.MUARA_DEV_MOCK !== "1") return null;
  if (cached !== undefined) return cached;
  try {
    // Plain Node require (not bundled): the mock lives outside src/ and outside git.
    const nodeRequire: NodeRequire =
      typeof __non_webpack_require__ === "function" ? __non_webpack_require__ : (0, eval)("require");
    cached = nodeRequire(path.join(process.cwd(), "dev-mock", "index.cjs")) as DevMockModule;
  } catch {
    console.warn("[dev-mock] MUARA_DEV_MOCK=1 but ./dev-mock/index.cjs was not found; using real Supabase.");
    cached = null;
  }
  return cached;
}
