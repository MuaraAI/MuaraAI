"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import type { PositionsConfig } from "@/lib/positions";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { filterMembers, RosterFilter } from "@/components/landing/syndicate-roster";
import { PixelTabs, TabSlide } from "@/components/ui/pixel-tabs";
import TierBadge from "@/components/members/tier-badge";
import { DIVISION_NAMES, divisionsOf, roleBadges } from "@/lib/structure";

interface MembersDirectoryProps {
  initialMembers: Member[];
  /** Official positions; a member's position chip only shows when it matches this list. */
  positions?: PositionsConfig;
}

const PLACEHOLDER_INSTITUTIONS = ["Tidak disebutkan", "Kampus lain di Indonesia"];

const filters: { id: RosterFilter; label: string }[] = [
  { id: "all", label: "Semua" },
  { id: "maintainer", label: "Maintainer" },
  { id: "head", label: "Head" },
  { id: "builder", label: "Builder" },
  { id: "creative", label: "Creative" },
  { id: "cybersecurity", label: "Cybersecurity" },
  { id: "top-tier", label: "Peringkat tier" },
];
const FILTER_ORDER = filters.map((f) => f.id);

export default function MembersDirectory({ initialMembers, positions }: MembersDirectoryProps) {
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [search, setSearch] = useState("");

  const official = new Set(positions ? Object.values(positions).flat() : []);
  // Show only positions that are on the official list, from the new tracks list or (older rows) the track columns.
  const officialTracks = (member: Member) =>
    [...new Set([...(member.tracks ?? []), member.track, member.secondary_track].filter((track): track is string => Boolean(track) && official.has(track as string)))];

  const filtered = useMemo(() => {
    const list = filterMembers(initialMembers, filter);
    const query = search.trim().toLowerCase();
    if (!query) return list;
    return list.filter((member) =>
      [member.full_name, member.github_username, member.campus, ...(member.tracks ?? []), ...divisionsOf(member), ...roleBadges(member)]
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
                      {roleBadges(member).map((badge) => <span key={badge} className="px-chip bg-white px-2 py-0.5 font-mono text-[11px] font-semibold text-muara-ocean">{badge}</span>)}
                      {divisionsOf(member).map((division) => <span key={division} className="px-chip px-2 py-0.5 font-mono text-[11px] font-medium text-secondary">{DIVISION_NAMES[division]}</span>)}
                      {officialTracks(member).map((track) => <span key={track} className="px-chip px-2 py-0.5 font-mono text-[11px] font-medium text-foreground">{track}</span>)}
                    </div>
                    {member.campus && !PLACEHOLDER_INSTITUTIONS.includes(member.campus) ? (
                      <dl className="mt-5 space-y-2 text-xs">
                        <div className="flex justify-between gap-3"><dt className="text-secondary">Institusi</dt><dd className="text-right text-foreground">{member.campus}</dd></div>
                      </dl>
                    ) : null}
                  </div>
                  <div className="mt-5 flex items-center justify-between border-t border-stroke pt-4">
                    <TierBadge tier={member.tier} streak={member.streak} />
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
