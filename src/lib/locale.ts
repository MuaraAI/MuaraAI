export type Locale = "id" | "en";

/** Request header the middleware sets for server components (a visitor-supplied value is always overwritten). */
export const LOCALE_HEADER = "x-locale";

const ENGLISH_PATHS = new Set(["/en", "/en/join", "/en/onboarding", "/en/terms", "/en/privacy", "/en/code-of-conduct"]);

/**
 * English only on the pages that really are English. An unknown /en/... path renders the Indonesian 404,
 * so it stays Indonesian and the document language matches what is on screen.
 */
export function localeFor(pathname: string): Locale {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return ENGLISH_PATHS.has(path) ? "en" : "id";
}

/** Anything other than exactly "en" is Indonesian, so a value from outside (or an inherited key like "constructor") can never pick a table entry. */
export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "id";
}

export function localeFromHeader(value: string | null): Locale {
  return normalizeLocale(value);
}
