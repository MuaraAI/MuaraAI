import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchOrgRepos } from "@/lib/github-repos";
import { GITHUB_ORG_URL } from "@/lib/constants";
import { communityContent, hiddenRepoNames } from "@/lib/community-content";
import { PageHeader } from "@/components/ui/section";
import Icon from "@/components/ui/icon";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Karya | MuaraAI",
  description: "Karya anggota dan komunitas MuaraAI: repo publik di GitHub yang bisa kamu pakai, pelajari, dan ikut kembangkan.",
};

const GITHUB_ORG = GITHUB_ORG_URL.split("/").pop() ?? "MuaraAI";

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function KaryaPage() {
  const { repos, ok } = await fetchOrgRepos(GITHUB_ORG, { token: process.env.GITHUB_ORG_TOKEN });
  // The products have their own page; the org profile and unreleased repos stay out of the list.
  const featured = new Set(communityContent.products.map((product) => product.repo.toLowerCase()));
  const hidden = new Set(hiddenRepoNames.map((name) => name.toLowerCase()));
  const works = repos.filter((repo) => !hidden.has(repo.name.toLowerCase()) && !featured.has(repo.url.toLowerCase()));

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Karya"
        title="Karya"
        description="Hasil kerja anggota dan komunitas MuaraAI. Semuanya open source: pakai, pelajari, atau ikut kembangkan lewat pull request."
        actions={
          <Link href="/projects" className="px-btn-ghost inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <span>Lihat project utama</span>
            <Icon name="arrow_forward" className="h-4 w-4" />
          </Link>
        }
      />

      {!ok ? (
        <p role="alert" className="text-sm text-secondary">
          Daftar karya belum bisa dimuat sekarang. Kamu tetap bisa melihatnya langsung di GitHub.
        </p>
      ) : works.length === 0 ? (
        <p className="text-sm text-secondary">Belum ada karya lain.</p>
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
                <p className="mt-2 text-sm text-secondary">{repo.description || "Belum ada deskripsi."}</p>
              </div>
              <p className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-secondary">
                {repo.language ? <span className="font-mono">{repo.language}</span> : null}
                {repo.stars > 0 ? <span>{repo.stars} bintang</span> : null}
                {repo.pushedAt ? <span>Diperbarui {dateFormat.format(new Date(repo.pushedAt))}</span> : null}
              </p>
            </li>
          ))}
        </ul>
      )}

      <section className="px-frame mt-14 flex flex-col gap-4 bg-surface-alt p-6 [--px-line:#CFE2EE] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Punya karya sendiri?</h2>
          <p className="mt-1 max-w-xl text-sm text-secondary">
            Buka pull request ke repo org atau usulkan repo baru. Karya yang sudah di-merge dan di-approve anggota lain dihitung sebagai kontribusimu.
          </p>
        </div>
        <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="px-btn inline-flex w-fit shrink-0 items-center gap-2 px-5 py-2.5 text-xs font-bold">
          <Icon name="github" className="h-4 w-4" />
          <span>Buka di GitHub</span>
        </a>
      </section>
    </div>
  );
}
