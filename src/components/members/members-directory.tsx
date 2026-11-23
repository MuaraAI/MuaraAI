"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { filterMembers, RosterFilter } from "@/components/landing/syndicate-roster";
import { PixelTabs, TabSlide } from "@/components/ui/pixel-tabs";

interface MembersDirectoryProps {
  initialMembers: Member[];
}

const filters: { id: RosterFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "maintainer", label: "Maintainer" },
  { id: "builder", label: "Builder" },
  { id: "creative", label: "Creative" },
  { id: "top-commits", label: "Kontributor aktif" },
];
const FILTER_ORDER = filters.map((f) => f.id);

export default function MembersDirectory({ initialMembers }: MembersDirectoryProps) {
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const list = filterMembers(initialMembers, filter);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((member) =>
      [member.full_name, member.github_username, member.campus, member.prodi, member.kelas, member.division, member.role_title]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [initialMembers, filter, search]);

  return (
    <div className="space-y-8">
      <div className="px-frame flex flex-col gap-4 bg-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full sm:max-w-sm">
          <span className="sr-only">Cari anggota</span>
          <Icon name="search" className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-secondary" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama atau @GitHub"
            aria-label="Cari anggota"
            className="min-h-11 w-full border-2 border-[#CFE2EE] bg-surface-alt pl-10 pr-4 focus:border-muara-ocean text-sm text-foreground placeholder-slate-400 focus:bg-white"
          />
        </label>
        <PixelTabs tabs={filters} value={filter} onChange={setFilter} ariaLabel="Filter anggota" idPrefix="member-filter" className="min-w-0" />
      </div>

      <div className="flex items-center justify-between text-sm text-secondary">
        <span><strong className="text-foreground">{filtered.length}</strong> anggota</span>
        {search ? <button type="button" onClick={() => setSearch("")} className="min-h-11 text-muara-ocean hover:underline">Reset pencarian</button> : null}
      </div>

      <TabSlide value={filter} order={FILTER_ORDER} idPrefix="member-filter">
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-[#CFE2EE] bg-surface-alt p-12 text-center">
          <h2 className="font-display text-lg font-semibold text-foreground">Tidak ada anggota yang cocok</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-secondary">Coba ubah kata kunci atau pilih filter lain.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((member, index) => {
            const titles = Array.from(new Set([member.role_title, ...(member.titles || [])].filter(Boolean)));
            return (
              <FadeIn key={member.id} delay={index * 0.04}>
                <article className="px-card px-card-hover flex h-full flex-col justify-between bg-white p-5">
                  <div>
                    <div className="flex items-center gap-3">
                      <Image
                        src={member.avatar_url || `https://github.com/${member.github_username}.png`}
                        alt={member.full_name}
                        width={52}
                        height={52}
                        className="px-frame object-cover [--px-line:#CFE2EE]"
                        unoptimized
                      />
                      <div className="min-w-0">
                        <h2 className="truncate font-display text-base font-semibold text-foreground">{member.full_name}</h2>
                        <p className="truncate text-xs font-mono text-secondary">@{member.github_username}</p>
                      </div>
                    </div>
                    <div className="mt-5 flex flex-wrap gap-1.5">
                      {titles.map((title) => <span key={title} className="px-chip bg-surface-alt px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">{title}</span>)}
                      <span className="px-chip px-2 py-0.5 font-mono text-[11px] font-medium capitalize text-secondary">{member.division}</span>
                    </div>
                    <dl className="mt-5 space-y-2 text-xs">
                      <div className="flex justify-between gap-3"><dt className="text-secondary">Kampus</dt><dd className="text-right text-foreground">{member.campus || "UBSI Pontianak"}</dd></div>
                      {member.kelas ? <div className="flex justify-between gap-3"><dt className="text-secondary">Kelas</dt><dd className="text-right font-mono text-foreground">{member.kelas}</dd></div> : null}
                      {member.prodi ? <div className="flex justify-between gap-3"><dt className="text-secondary">Prodi</dt><dd className="text-right text-foreground">{member.prodi}</dd></div> : null}
                    </dl>
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-stroke pt-4">
                    <span className="text-xs text-secondary">{member.total_commits || 0} kontribusi</span>
                    <Link href={member.github_url || `https://github.com/${member.github_username}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-muara-ocean hover:underline">
                      GitHub <Icon name="open_in_new" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              </FadeIn>
            );
          })}
        </div>
      )}
      </TabSlide>
    </div>
  );
}
