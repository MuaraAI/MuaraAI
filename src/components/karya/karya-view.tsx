import React from "react";
import Link from "next/link";
import { fetchOrgRepos } from "@/lib/github-repos";
import { GITHUB_ORG_URL } from "@/lib/constants";
import { communityContent, hiddenRepoNames } from "@/lib/community-content";
import { PageHeader } from "@/components/ui/section";
import Icon from "@/components/ui/icon";
import { normalizeLocale, type Locale } from "@/lib/locale";

const GITHUB_ORG = GITHUB_ORG_URL.split("/").pop() ?? "MuaraAI";

const COPY = {
  id: {
    title: "Karya",
    description: "Hasil kerja anggota dan komunitas MuaraAI. Semuanya open source: pakai, pelajari, atau ikut kembangkan lewat pull request.",
    mainProjects: "Lihat project utama",
    mainProjectsHref: "/projects",
    failed: "Daftar karya belum bisa dimuat sekarang. Kamu tetap bisa melihatnya langsung di GitHub.",
    empty: "Belum ada karya lain.",
    noDescription: "Belum ada deskripsi.",
    stars: (n: number) => `${n} bintang`,
    updated: (date: string) => `Diperbarui ${date}`,
    ownTitle: "Punya karya sendiri?",
    ownText: "Buka pull request ke repo org atau usulkan repo baru. Karya yang sudah di-merge dan di-approve anggota lain dihitung sebagai kontribusimu.",
    github: "Buka di GitHub",
    dateLocale: "id-ID",
  },
  en: {
    title: "Works",
    description: "What members and the community have made. Everything is open source: use it, learn from it, or help build it with a pull request.",
    mainProjects: "See the main projects",
    mainProjectsHref: "/en",
    failed: "The list of works cannot be loaded right now. You can still see it on GitHub.",
    empty: "No other works yet.",
    noDescription: "No description yet.",
    stars: (n: number) => `${n} ${n === 1 ? "star" : "stars"}`,
    updated: (date: string) => `Updated ${date}`,
    ownTitle: "Have your own work?",
    ownText: "Open a pull request to an org repo or propose a new one. Work that is merged and approved by another member counts toward your contribution.",
    github: "Open on GitHub",
    dateLocale: "en-GB",
  },
} as const;

/** The Works page body, shared by /karya (Indonesian) and /en/karya (English). */
export default async function KaryaView({ locale }: { locale: Locale }) {
  const lang = normalizeLocale(locale);
  const t = COPY[lang];
  const dateFormat = new Intl.DateTimeFormat(t.dateLocale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

  const { repos, ok } = await fetchOrgRepos(GITHUB_ORG, { token: process.env.GITHUB_ORG_TOKEN });
  // The products have their own page; the org profile and unreleased repos stay out of the list.
  const featured = new Set(communityContent.products.map((product) => product.repo.toLowerCase()));
  const hidden = new Set(hiddenRepoNames.map((name) => name.toLowerCase()));
  const works = repos.filter((repo) => !hidden.has(repo.name.toLowerCase()) && !featured.has(repo.url.toLowerCase()));

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow={t.title}
        title={t.title}
        description={t.description}
        actions={
          <Link href={t.mainProjectsHref} className="px-btn-ghost inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <span>{t.mainProjects}</span>
            <Icon name="arrow_forward" className="h-4 w-4" />
          </Link>
        }
      />

      {!ok ? (
        <p role="alert" className="text-sm text-secondary">
          {t.failed}
        </p>
      ) : works.length === 0 ? (
        <p className="text-sm text-secondary">{t.empty}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {works.map((repo) => (
            <li key={repo.name} className="px-card flex flex-col justify-between bg-white p-5">
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean hover:underline">
                    {repo.name}
                  </a>
                </h2>
                <p className="mt-2 text-sm text-secondary">{repo.description || t.noDescription}</p>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                {repo.language ? <span className="font-mono">{repo.language}</span> : null}
                {repo.stars > 0 ? <span>{t.stars(repo.stars)}</span> : null}
                {repo.pushedAt ? <span>{t.updated(dateFormat.format(new Date(repo.pushedAt)))}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      )}

      <section className="px-frame mt-14 flex flex-col gap-4 bg-surface-alt p-6 [--px-line:#CFE2EE] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">{t.ownTitle}</h2>
          <p className="mt-1 max-w-xl text-sm text-secondary">{t.ownText}</p>
        </div>
        <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="px-btn inline-flex w-fit shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-bold">
          <Icon name="github" className="h-4 w-4" />
          <span>{t.github}</span>
        </a>
      </section>
    </div>
  );
}
