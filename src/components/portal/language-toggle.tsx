"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, type Locale } from "@/lib/locale";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;
const OPTIONS: { value: Locale; label: string }[] = [
  { value: "id", label: "ID" },
  { value: "en", label: "EN" },
];

/** Switches the member portal between Indonesian and English by setting the language cookie and re-rendering. */
export default function LanguageToggle({ locale, label }: { locale: Locale; label: string }) {
  const router = useRouter();

  const choose = (value: Locale) => {
    if (value === locale) return;
    document.cookie = `${LOCALE_COOKIE}=${value}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
    router.refresh();
  };

  return (
    <div role="group" aria-label={label} className="flex items-center gap-1 px-3 font-mono text-xs">
      <span className="mr-1 text-secondary">{label}</span>
      {OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => choose(option.value)}
          aria-pressed={option.value === locale}
          className={`min-h-9 min-w-9 px-2 font-semibold transition-colors ${
            option.value === locale ? "bg-[#DCEBF5] text-foreground" : "text-secondary hover:bg-surface-alt hover:text-foreground"
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
