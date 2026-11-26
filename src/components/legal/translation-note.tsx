import React from "react";
import Link from "next/link";

/** Shown on every English legal page: it is a convenience translation and the Indonesian text is the one that applies. */
export default function TranslationNote({ path }: { path: string }) {
  return (
    <p className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-4 text-xs leading-relaxed text-secondary">
      This page is an English translation of the{" "}
      <Link href={`/${path}`} className="font-semibold text-muara-ocean hover:underline">
        Indonesian original
      </Link>
      . If the two differ, the Indonesian version applies.
    </p>
  );
}
