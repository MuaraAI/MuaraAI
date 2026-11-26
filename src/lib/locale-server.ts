import { headers } from "next/headers";
import { LOCALE_HEADER, localeFromHeader, type Locale } from "@/lib/locale";

/** The language of the current request, from the header the middleware always sets (never from client input). */
export async function currentLocale(): Promise<Locale> {
  return localeFromHeader((await headers()).get(LOCALE_HEADER));
}
