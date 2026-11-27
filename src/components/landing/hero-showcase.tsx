import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import ProductList from "@/components/landing/product-list";
import type { Locale } from "@/lib/locale";
import { GITHUB_ORG_URL } from "@/lib/constants";
import { isMaintainer } from "@/lib/guards";
import type { OrgRepo } from "@/lib/github-repos";

export interface HeroStats {
  maintainers: number;
  members: number;
  /** FluxCode's GitHub stars; left out when GitHub could not be reached. */
  stars?: number;
}

const COPY = {
  id: {
    all: "Lihat semua project",
    maintainers: (n: number) => `${n} maintainer`,
    members: (n: number) => `${n} anggota`,
    stars: (n: number) => `FluxCode ${n} bintang`,
  },
  en: {
    all: "See all projects",
    maintainers: (n: number) => `${n} ${n === 1 ? "maintainer" : "maintainers"}`,
    members: (n: number) => `${n} ${n === 1 ? "member" : "members"}`,
    stars: (n: number) => `FluxCode ${n} ${n === 1 ? "star" : "stars"}`,
  },
} as const;

/** Numbers for the one-line summary: people from the members table, FluxCode's stars from GitHub (left out when GitHub was unreachable). */
export function buildHeroStats(members: { hierarchy?: string | null; roles?: string[] | null }[], github: { repos: OrgRepo[]; ok: boolean }): HeroStats {
  const stars = github.ok ? github.repos.find((repo) => repo.name === "FluxCode")?.stars : undefined;
  return { maintainers: members.filter((member) => isMaintainer(member)).length, members: members.length, ...(stars !== undefined ? { stars } : {}) };
}

/** The hero's right-hand side: what the community has actually shipped, with real numbers beneath it. */
export default function HeroShowcase({ locale = "id", stats }: { locale?: Locale; stats?: HeroStats }) {
  const t = COPY[locale];
  const summary = stats
    ? [t.maintainers(stats.maintainers), t.members(stats.members), ...(stats.stars !== undefined ? [t.stars(stats.stars)] : [])].join(" · ")
    : null;

  return (
    <div className="space-y-5">
      <ProductList locale={locale} />
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 text-sm">
        {summary ? <p className="font-mono text-xs text-secondary">{summary}</p> : <span />}
        {locale === "en" ? (
          // The project page is in Indonesian, so English visitors go to the org itself.
          <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-muara-ocean hover:underline">
            {t.all}
            <Icon name="arrow_forward" className="h-4 w-4" />
          </a>
        ) : (
          <Link href="/projects" className="inline-flex items-center gap-1.5 font-semibold text-muara-ocean hover:underline">
            {t.all}
            <Icon name="arrow_forward" className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
