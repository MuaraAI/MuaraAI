import React from "react";
import { TIER_NAMES } from "@/lib/contributions/tiers";

const STYLES: Record<number, string> = {
  1: "bg-surface-alt text-foreground",
  2: "bg-sky-50 text-sky-900",
  3: "bg-indigo-50 text-indigo-900",
  4: "bg-amber-50 text-amber-900",
};

/** Recognition only: the tier name and, from two months on, the streak. Renders nothing without a tier. */
export default function TierBadge({ tier, streak }: { tier?: number; streak?: number }) {
  const name = tier ? TIER_NAMES[tier as keyof typeof TIER_NAMES] : undefined;
  if (!name) return null;

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <span className={`px-chip px-2 py-0.5 font-mono text-[11px] font-bold ${STYLES[tier as number]}`}>{name}</span>
      {streak && streak >= 2 ? <span className="text-[11px] text-secondary">{streak} bulan berturut-turut</span> : null}
    </span>
  );
}
