"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { communityContent } from "@/lib/community-content";
import SpotlightCard from "@/components/ui/spotlight-card";

export type RosterFilter =
  | "maintainer"
  | "lead"
  | "head"
  | "creative"
  | "builder"
  | "top-commits"
  | "all";

export function filterMembers(members: Member[], filter: RosterFilter): Member[] {
  if (filter === "top-commits") {
    return [...members].sort((a, b) => (b.total_commits || 0) - (a.total_commits || 0));
  }
  if (filter === "maintainer") {
    return members.filter(
      (m) =>
        m.hierarchy === "maintainer" ||
        m.roles?.includes("maintainer") ||
        m.sub_hierarchy === "founder" ||
        m.sub_hierarchy === "co-founder" ||
        (m.titles || []).some((t) => /founder|maintainer/i.test(t))
    );
  }
  if (filter === "lead") {
    return members.filter(
      (m) =>
        m.hierarchy === "lead" ||
        m.roles?.some((r) => r.startsWith("lead")) ||
        m.sub_hierarchy?.startsWith("lead") ||
        (m.titles || []).some((t) => /lead/i.test(t))
    );
  }
  if (filter === "head") {
    return members.filter(
      (m) =>
        m.hierarchy === "head" ||
        m.roles?.some((r) => r.startsWith("head")) ||
        m.sub_hierarchy?.startsWith("head") ||
        (m.titles || []).some((t) => /head/i.test(t))
    );
  }
  if (filter === "creative") {
    return members.filter(
      (m) =>
        m.division === "creative" ||
        m.roles?.includes("creative") ||
        m.roles?.includes("member-creative") ||
        m.sub_hierarchy === "member-creative"
    );
  }
  if (filter === "builder") {
    return members.filter(
      (m) =>
        m.division === "builder" ||
        m.roles?.includes("builder") ||
        m.roles?.includes("member-builder") ||
        m.sub_hierarchy === "member-builder"
    );
  }
  return members;
}

interface SyndicateRosterProps {
  initialMembers?: Member[];
}

const CORE_MAINTAINERS = communityContent.coreMaintainers.map((member) => ({
  githubUsername: member.github,
  fullName: member.name,
  nim: member.nim,
  title: member.title,
  roleBadge: member.title as "Founder" | "Co-Founder",
  division: member.division.toLowerCase() as "builder" | "creative",
  roles: member.roles,
}));

export default function SyndicateRoster({ initialMembers = [] }: SyndicateRosterProps) {
  // Merge live DB data if member has registered in public.members
  const maintainers = CORE_MAINTAINERS.map((core) => {
    const liveMatch = initialMembers.find(
      (m) => m.github_username?.toLowerCase() === core.githubUsername.toLowerCase()
    );
    return {
      id: liveMatch?.id || core.githubUsername,
      fullName: liveMatch?.full_name || core.fullName,
      nim: core.nim,
      githubUsername: core.githubUsername,
      title: liveMatch?.role_title || core.title,
      roleBadge: liveMatch?.sub_hierarchy === "founder" ? ("Founder" as const) : core.roleBadge,
      division: core.division,
      roles: core.roles,
      avatarUrl: `https://github.com/${core.githubUsername}.png`,
      githubUrl: `https://github.com/${core.githubUsername}`,
      linkedinUrl: liveMatch?.linkedin_url,
      portfolioUrl: liveMatch?.portfolio_url,
    };
  });

  return (
    <section id="syndicate" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-stroke bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Dewan Pengarah & Inisiator
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Tim inti MuaraAI
          </p>
          <p className="text-sm text-secondary mt-3 leading-relaxed font-sans">
            Founder dan maintainer yang memulai MuaraAI dari UBSI Pontianak dan membangun komunitasnya bersama mahasiswa UBSI.
          </p>
        </div>

        {/* 3 Maintainer Cards — Minimalist & Anti-Slop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {maintainers.map((m, idx) => (
            <FadeIn key={m.id} delay={idx * 0.1}>
              <SpotlightCard className="rounded-[18px] border border-stroke bg-white p-6 hover:border-muara-ocean transition-all flex flex-col justify-between group shadow-diffusion hover:shadow-lift h-full">
                <div>
                  {/* Card Header: Live Avatar & Name */}
                  <div className="flex items-center gap-3.5 mb-5">
                    <div className="relative shrink-0">
                      <Image
                        src={m.avatarUrl}
                        alt={m.fullName}
                        width={52}
                        height={52}
                        className="rounded-full border-2 border-muara-ocean/30 group-hover:border-muara-ocean transition-colors object-cover"
                        unoptimized
                      />
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-base text-foreground group-hover:text-muara-ocean transition-colors truncate">
                        {m.fullName} | {m.nim}
                      </h3>
                      <p className="text-xs font-mono text-secondary truncate">
                        @{m.githubUsername}
                      </p>
                    </div>
                  </div>

                  {/* Badges: Title, Role & Division */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[11px] font-mono font-bold shadow-xs ${
                        m.roleBadge === "Founder"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-sky-100 text-sky-900 border border-sky-300"
                      }`}
                    >
                      {m.roleBadge}
                    </span>
                    <span className="rounded bg-surface-alt border border-stroke px-2.5 py-0.5 text-[11px] font-mono text-slate-700 font-medium">
                      Maintainer
                    </span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-mono uppercase font-bold ${
                        m.division === "builder"
                          ? "bg-emerald-50 border border-emerald-200 text-emerald-700"
                          : "bg-purple-50 border border-purple-200 text-purple-700"
                      }`}
                    >
                      {m.division}
                    </span>
                  </div>
                </div>

                {/* Footer: Direct GitHub Link */}
                <div className="pt-4 border-t border-stroke flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Link
                      href={m.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-400 hover:text-muara-ocean transition-colors p-1"
                      aria-label={`${m.fullName} GitHub`}
                    >
                      <Icon name="code" className="w-4 h-4" />
                    </Link>
                    {m.linkedinUrl && (
                      <Link
                        href={m.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-muara-ocean transition-colors p-1"
                        aria-label={`${m.fullName} LinkedIn`}
                      >
                        <Icon name="public" className="w-4 h-4" />
                      </Link>
                    )}
                  </div>

                  <Link
                    href={`https://github.com/${m.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-semibold text-muara-ocean hover:underline"
                  >
                    <span>Profil GitHub</span>
                    <Icon name="open_in_new" className="w-3 h-3" />
                  </Link>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>

        {/* Navigation Banner to Full Member Directory */}
        <div className="mt-12 rounded-[20px] border border-stroke bg-surface-alt p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-xl bg-white border border-stroke flex items-center justify-center text-muara-ocean shrink-0 mx-auto sm:mx-0 shadow-xs">
              <Icon name="groups" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-foreground">
                Direktori Anggota & Roster Lengkap
              </h4>
              <p className="text-xs text-secondary mt-1 max-w-xl font-sans">
                Jelajahi profil mahasiswa UBSI, kampus, kelas, prodi, divisi, dan kontribusi yang tampil secara faktual.
              </p>
            </div>
          </div>

          <Link
            href="/members"
            className="inline-flex items-center gap-2 rounded-xl bg-muara-ocean hover:bg-muara-ocean-dark text-white px-6 py-3 text-xs font-bold font-sans transition-all shadow-sm shrink-0 w-full sm:w-auto justify-center"
          >
            <span>Lihat Direktori Seluruh Anggota</span>
            <Icon name="arrow_forward" className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
