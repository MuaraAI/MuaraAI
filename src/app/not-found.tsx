import React from "react";
import { headers } from "next/headers";
import NotFoundView from "@/components/ui/not-found-view";
import { LOCALE_HEADER, localeFromHeader } from "@/lib/locale";

export default async function NotFound() {
  return <NotFoundView locale={localeFromHeader((await headers()).get(LOCALE_HEADER))} />;
}
