"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";

export type RosterFilter = "all" | "top-commits" | "core" | "builder" | "creative";

export function filterMembers(members: Member[], filter: RosterFilter): Member[] {
  if (filter === "top-commits") {
    return [...members].sort((a, b) => (b.total_commits || 0) - (a.total_commits || 0));
  }
  if (filter === "core") {
    return members.filter((m) => m.hierarchy === "maintainer" || m.roles?.includes("maintainer"));
  }
  if (filter === "builder" || filter === "creative") {
    return members.filter((m) => m.division === filter);
  }
  return members;
}

interface SyndicateRosterProps {
  initialMembers?: Member[];
}

export default function SyndicateRoster({ initialMembers = [] }: SyndicateRosterProps) {
  const [filter, setFilter] = useState<RosterFilter>("all");

  const filtered = filterMembers(initialMembers, filter);

  return (
    <section id="syndicate" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
              Jaringan Pengembang & Kreator
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The Syndicate (Member Roster)
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 bg-surface rounded-lg border border-border">
            {(
              [
                { id: "all", label: "All" },
                { id: "top-commits", label: "Top Commits" },
                { id: "core", label: "Core Team" },
                { id: "builder", label: "Builder" },
                { id: "creative", label: "Creative" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors ${
                  filter === tab.id
                    ? "bg-muara-cyan text-background font-bold shadow-sm"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border p-12 text-center text-slate-500 text-sm">
            Belum ada anggota yang terdaftar pada kategori ini.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((member, idx) => {
              const isTopThree = filter === "top-commits" && idx < 3 && (member.total_commits || 0) > 0;
              return (
                <div
                  key={member.id}
                  className="rounded-xl border border-border bg-surface p-6 hover:border-muara-cyan/40 transition-all flex flex-col justify-between group shadow-md"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        {member.avatar_url ? (
                          <Image
                            src={member.avatar_url}
                            alt={member.full_name}
                            width={48}
                            height={48}
                            className="rounded-full border border-border group-hover:border-muara-cyan transition-colors"
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-surface-hover border border-border flex items-center justify-center font-display font-bold text-white">
                            {member.full_name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <h3 className="font-display font-bold text-base text-white group-hover:text-muara-cyan transition-colors">
                            {member.full_name}
                          </h3>
                          <p className="text-xs font-mono text-slate-400">
                            @{member.github_username}
                          </p>
                        </div>
                      </div>

                      {/* Commit Pill */}
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-mono font-semibold ${
                          isTopThree
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400"
                            : "bg-background border border-border text-slate-400"
                        }`}
                      >
                        <span className="material-symbols-rounded text-xs">
                          {isTopThree ? "local_fire_department" : "commit"}
                        </span>
                        {member.total_commits || 0}
                      </span>
                    </div>

                    {/* Role & Titles */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {member.role_title && (
                        <span className="rounded bg-muara-cyan/10 border border-muara-cyan/30 px-2 py-0.5 text-[11px] font-mono text-muara-cyan font-bold">
                          {member.role_title}
                        </span>
                      )}
                      {member.titles?.map((title, tIdx) => (
                        <span
                          key={tIdx}
                          className="rounded bg-surface-hover border border-border px-2 py-0.5 text-[11px] font-mono text-slate-300"
                        >
                          {title}
                        </span>
                      ))}
                    </div>

                    {member.bio && (
                      <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                        {member.bio}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-3 border-t border-border/50 text-xs font-mono text-slate-400">
                    <span className="uppercase text-[10px] text-slate-500 tracking-wider">
                      {member.division}
                    </span>
                    {member.track && (
                      <>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-300">{member.track}</span>
                      </>
                    )}
                    <div className="ml-auto flex items-center gap-2">
                      {member.github_url && (
                        <Link
                          href={member.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white"
                          aria-label="GitHub"
                        >
                          <span className="material-symbols-rounded text-sm">terminal</span>
                        </Link>
                      )}
                      {member.portfolio_url && (
                        <Link
                          href={member.portfolio_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-white"
                          aria-label="Portfolio"
                        >
                          <span className="material-symbols-rounded text-sm">open_in_new</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
