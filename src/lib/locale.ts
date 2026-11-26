export type Locale = "id" | "en";

/** Request header the middleware sets for server components (a visitor-supplied value is always overwritten). */
export const LOCALE_HEADER = "x-locale";

/** Set (by the sign-in callback or the portal toggle) so the member portal, which has no /en URLs, can speak English. */
export const LOCALE_COOKIE = "muara-lang";

const PORTAL_PATHS = ["/dashboard", "/membership-exit"];
const isPortalPath = (path: string) => PORTAL_PATHS.some((base) => path === base || path.startsWith(`${base}/`));

/**
 * English for /en and everything under it (including the English 404 of an unknown /en/... path), and for the
 * member portal when the language cookie says so. The cookie is ignored everywhere else, so a public page's
 * <html lang> always matches its URL. "/english" and "/members/en" stay Indonesian.
 */
export function localeFor(pathname: string, cookie?: string): Locale {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  if (path === "/en" || path.startsWith("/en/")) return "en";
  return isPortalPath(path) ? normalizeLocale(cookie) : "id";
}

/** Anything other than exactly "en" is Indonesian, so a value from outside (or an inherited key like "constructor") can never pick a table entry. */
export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "id";
}

export function localeFromHeader(value: string | null): Locale {
  return normalizeLocale(value);
}
