"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import SpotlightCard from "@/components/ui/spotlight-card";
import { filterMembers, RosterFilter } from "@/components/landing/syndicate-roster";

interface MembersDirectoryProps {
  initialMembers: Member[];
}

export default function MembersDirectory({ initialMembers }: MembersDirectoryProps) {
  const [filter, setFilter] = useState<RosterFilter>("all");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = filterMembers(initialMembers, filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (m) =>
          m.full_name.toLowerCase().includes(q) ||
          m.github_username.toLowerCase().includes(q) ||
          (m.campus && m.campus.toLowerCase().includes(q)) ||
          (m.prodi && m.prodi.toLowerCase().includes(q)) ||
          (m.kelas && m.kelas.toLowerCase().includes(q)) ||
          (m.track && m.track.toLowerCase().includes(q)) ||
          (m.division && m.division.toLowerCase().includes(q)) ||
          (m.role_title && m.role_title.toLowerCase().includes(q))
      );
    }
    return list;
  }, [initialMembers, filter, search]);

  return (
    <div className="space-y-8">
      {/* Search and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Icon
            name="search"
            className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, @github, atau track..."
            className="w-full rounded-lg border border-border bg-white pl-10 pr-4 py-2.5 text-xs text-foreground placeholder-slate-400 focus:border-muara-ocean focus:outline-none font-mono shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-foreground font-mono"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-lg border border-border">
          {(
            [
              { id: "all", label: "All" },
              { id: "top-commits", label: "Top Commits" },
              { id: "maintainer", label: "Maintainer" },
              { id: "lead", label: "Lead of Project" },
              { id: "head", label: "Head of Creative/Builder" },
              { id: "creative", label: "Creative" },
              { id: "builder", label: "Builder" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                filter === tab.id
                  ? "bg-muara-ocean text-white font-bold shadow-sm"
                  : "text-slate-600 hover:text-foreground hover:bg-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      <div className="text-xs font-mono text-slate-500">
        Menampilkan <strong>{filtered.length}</strong> anggota terdaftar
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center text-slate-500 text-sm bg-slate-50 font-mono">
          Tidak ada anggota yang cocok dengan filter atau pencarian Anda.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((member, idx) => {
            const isTopThree =
              filter === "top-commits" && idx < 3 && (member.total_commits || 0) > 0;
            return (
              <FadeIn key={member.id} delay={idx * 0.05}>
                <SpotlightCard className="rounded-xl border border-border bg-white p-6 hover:border-muara-ocean transition-all flex flex-col justify-between group shadow-sm h-full">
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <Image
                          src={member.avatar_url || `https://github.com/${member.github_username}.png`}
                          alt={member.full_name}
                          width={48}
                          height={48}
                          className="rounded-full border border-stroke group-hover:border-muara-ocean transition-colors object-cover"
                          unoptimized
                        />
                        <div>
                          <h3 className="font-display font-bold text-base text-foreground group-hover:text-muara-ocean transition-colors">
                            {member.full_name}
                          </h3>
                          <p className="text-xs font-mono text-slate-500">
                            @{member.github_username}
                          </p>
                        </div>
                      </div>

                      {/* Commit Pill */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold ${
                          isTopThree
                            ? "bg-amber-50 border border-amber-300 text-amber-800"
                            : "bg-slate-50 border border-border text-slate-600"
                        }`}
                      >
                        <Icon
                          name={isTopThree ? "local_fire_department" : "commit"}
                          className="w-3.5 h-3.5"
                        />
                        {member.total_commits || 0}
                      </span>
                    </div>

                    {/* Role & Titles */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {member.role_title && (
                        <span className="rounded bg-sky-50 border border-sky-200 px-2 py-0.5 text-[11px] font-mono text-muara-ocean font-bold">
                          {member.role_title}
                        </span>
                      )}
                      {member.titles?.map((title, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700"
                        >
                          {title}
                        </span>
                      ))}
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                          member.division === "builder"
                            ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                            : "bg-purple-50 border border-purple-200 text-purple-700"
                        }`}
                      >
                        {member.division}
                      </span>
                    </div>

                    {member.bio && (
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                        {member.bio}
                      </p>
                    )}

                    {/* Campus & Kelas Badge */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px] font-mono">
                      <span className="inline-flex items-center gap-1 rounded bg-slate-50 border border-slate-200 px-2 py-0.5 text-slate-700">
                        <Icon name="school" className="w-3 h-3 text-muara-ocean" />
                        <span>{member.campus || "UBSI Pontianak"}</span>
                      </span>
                      {member.kelas && (
                        <span className="rounded bg-slate-50 border border-slate-200 px-1.5 py-0.5 text-slate-600 font-bold uppercase">
                          {member.kelas}
                        </span>
                      )}
                    </div>

                    {member.track && (
                      <div className="text-[11px] font-mono text-slate-500 mb-4 flex items-center gap-1.5">
                        <Icon name="terminal" className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">Track: {member.track}</span>
                      </div>
                    )}
                  </div>

                  {/* Social links */}
                  <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                    {member.github_url && (
                      <Link
                        href={member.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-muara-ocean transition-colors"
                        aria-label="GitHub Profile"
                      >
                        <Icon name="code" className="w-4 h-4" />
                      </Link>
                    )}
                    {member.linkedin_url && (
                      <Link
                        href={member.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-muara-ocean transition-colors"
                        aria-label="LinkedIn Profile"
                      >
                        <Icon name="public" className="w-4 h-4" />
                      </Link>
                    )}
                    {member.portfolio_url && (
                      <Link
                        href={member.portfolio_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-muara-ocean transition-colors ml-auto text-[11px] font-mono flex items-center gap-1"
                      >
                        <span>Portofolio</span>
                        <Icon name="open_in_new" className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </SpotlightCard>
              </FadeIn>
            );
          })}
        </div>
      )}
    </div>
  );
}
