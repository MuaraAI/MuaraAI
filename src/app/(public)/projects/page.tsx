import React from "react";
import type { Metadata } from "next";
import { fetchOrgRepos } from "@/lib/github-repos";
import { GITHUB_ORG_URL } from "@/lib/constants";
import { communityContent, hiddenRepoNames } from "@/lib/community-content";
import ProductList from "@/components/landing/product-list";
import { PageHeader } from "@/components/ui/section";
import Icon from "@/components/ui/icon";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Project | MuaraAI",
  description: "Repo publik MuaraAI di GitHub: tempat kamu bisa mulai berkontribusi.",
};

const GITHUB_ORG = GITHUB_ORG_URL.split("/").pop() ?? "MuaraAI";

const dateFormat = new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });

export default async function ProjectsPage() {
  const { repos, ok } = await fetchOrgRepos(GITHUB_ORG, { token: process.env.GITHUB_ORG_TOKEN });
  // Products already have their own cards; the org profile and unreleased repos stay out of the list.
  const featured = new Set(communityContent.products.map((product) => product.repo.toLowerCase()));
  const hidden = new Set(hiddenRepoNames.map((name) => name.toLowerCase()));
  const others = repos.filter((repo) => !hidden.has(repo.name.toLowerCase()) && !featured.has(repo.url.toLowerCase()));

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Project"
        title="Project MuaraAI"
        description="Produk komunitas dan semua repo publik di org MuaraAI. Pilih satu, baca README-nya, lalu buka PR pertamamu."
        actions={
          <a href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="px-btn inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <Icon name="github" className="h-4 w-4" />
            <span>Buka di GitHub</span>
          </a>
        }
      />

      <ProductList />

      <h2 className="mb-5 mt-14 font-display text-xl font-bold text-foreground">Repo lainnya</h2>
      {!ok ? (
        <p role="alert" className="text-sm text-secondary">
          Daftar repo belum bisa dimuat sekarang. Kamu tetap bisa melihatnya langsung di GitHub.
        </p>
      ) : others.length === 0 ? (
        <p className="text-sm text-secondary">Belum ada repo lain.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((repo) => (
            <li key={repo.name} className="px-card flex flex-col justify-between bg-white p-5">
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean hover:underline">
                    {repo.name}
                  </a>
                </h3>
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
    </div>
  );
}
