export type Locale = "id" | "en";

/** Request header the middleware sets for server components (a visitor-supplied value is always overwritten). */
export const LOCALE_HEADER = "x-locale";

/** English for /en and everything under it, including the English 404 of an unknown /en/... path. "/english" and "/members/en" stay Indonesian. */
export function localeFor(pathname: string): Locale {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  return path === "/en" || path.startsWith("/en/") ? "en" : "id";
}

/** Anything other than exactly "en" is Indonesian, so a value from outside (or an inherited key like "constructor") can never pick a table entry. */
export function normalizeLocale(value: unknown): Locale {
  return value === "en" ? "en" : "id";
}

export function localeFromHeader(value: string | null): Locale {
  return normalizeLocale(value);
}
