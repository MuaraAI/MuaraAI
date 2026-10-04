"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
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

interface CoreMaintainerConfig {
  githubUsername: string;
  fullName: string;
  title: string;
  roleBadge: "Founder" | "Co-Founder";
  division: "builder" | "creative";
  track: string;
  bio: string;
  avatarUrl: string;
  githubUrl: string;
}

const CORE_MAINTAINERS: CoreMaintainerConfig[] = [
  {
    githubUsername: "Curzyori",
    fullName: "Yuken Velino",
    title: "Founder & Lead Architect",
    roleBadge: "Founder",
    division: "builder",
    track: "AI Gateway & Systems Architecture",
    bio: "Inisiator Muara AI. Fokus pada arsitektur AI gateway mandiri, reverse-engineering API kampus, dan otomasi developer agent.",
    avatarUrl: "https://avatars.githubusercontent.com/u/87063462?v=4",
    githubUrl: "https://github.com/Curzyori",
  },
  {
    githubUsername: "Seeyaa77",
    fullName: "Seeyaa",
    title: "Co-Founder & Creative Lead",
    roleBadge: "Co-Founder",
    division: "creative",
    track: "Visual Identity & UI Direction",
    bio: "Pengarah estetika dan identitas visual komunitas. Mengawal standar desain anti-slop, branding produk ekosistem, dan tipografi modern.",
    avatarUrl: "https://avatars.githubusercontent.com/u/104278440?v=4",
    githubUrl: "https://github.com/Seeyaa77",
  },
  {
    githubUsername: "MyKineID",
    fullName: "Raffli (Verzio)",
    title: "Co-Founder & Core Builder",
    roleBadge: "Co-Founder",
    division: "builder",
    track: "FastAPI & Distributed Scrapling",
    bio: "Arsitek backend engine UBSI API. Mengembangkan scraper multi-tenant, caching Redis terdistribusi, dan automasi data akademik.",
    avatarUrl: "https://avatars.githubusercontent.com/u/121867160?v=4",
    githubUrl: "https://github.com/MyKineID",
  },
];

export default function SyndicateRoster({ initialMembers = [] }: SyndicateRosterProps) {
  // Merge live DB data if member has registered
  const maintainers = CORE_MAINTAINERS.map((core) => {
    const liveMatch = initialMembers.find(
      (m) => m.github_username?.toLowerCase() === core.githubUsername.toLowerCase()
    );
    return {
      id: liveMatch?.id || core.githubUsername,
      fullName: liveMatch?.full_name || core.fullName,
      githubUsername: core.githubUsername,
      title: core.title,
      roleBadge: core.roleBadge,
      division: core.division,
      track: liveMatch?.track || core.track,
      bio: liveMatch?.bio || core.bio,
      avatarUrl: liveMatch?.avatar_url || core.avatarUrl,
      githubUrl: liveMatch?.github_url || core.githubUrl,
      linkedinUrl: liveMatch?.linkedin_url,
      portfolioUrl: liveMatch?.portfolio_url,
      totalCommits: liveMatch?.total_commits || 0,
    };
  });

  return (
    <section id="syndicate" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Dewan Pengarah & Inisiator
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Core Syndicate • Maintainers
          </p>
          <p className="text-sm text-slate-500 mt-3 leading-relaxed">
            Inisiator dan pengarah rekayasa teknologi independen Muara AI yang mengawal standar kode, riset AI mandiri, dan transparansi komunitas.
          </p>
        </div>

        {/* 3 Maintainer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {maintainers.map((m, idx) => (
            <FadeIn key={m.id} delay={idx * 0.1}>
              <SpotlightCard className="rounded-2xl border border-border bg-white p-7 hover:border-muara-ocean transition-all flex flex-col justify-between group shadow-sm h-full">
                <div>
                  {/* Card Header: Avatar & Name */}
                  <div className="flex items-center gap-4 mb-5">
                    <div className="relative">
                      <Image
                        src={m.avatarUrl}
                        alt={m.fullName}
                        width={56}
                        height={56}
                        className="rounded-full border-2 border-muara-ocean/30 group-hover:border-muara-ocean transition-colors object-cover"
                        unoptimized
                      />
                      <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-white">
                        <span className="h-1.5 w-1.5 rounded-full bg-white" />
                      </span>
                    </div>

                    <div>
                      <h3 className="font-display font-bold text-lg text-foreground group-hover:text-muara-ocean transition-colors">
                        {m.fullName}
                      </h3>
                      <p className="text-xs font-mono text-slate-500">
                        @{m.githubUsername}
                      </p>
                    </div>
                  </div>

                  {/* Badges: Role & Division */}
                  <div className="flex flex-wrap items-center gap-2 mb-4">
                    <span
                      className={`rounded px-2.5 py-0.5 text-[11px] font-mono font-bold shadow-xs ${
                        m.roleBadge === "Founder"
                          ? "bg-amber-100 text-amber-900 border border-amber-300"
                          : "bg-sky-100 text-sky-900 border border-sky-300"
                      }`}
                    >
                      {m.roleBadge}
                    </span>
                    <span className="rounded bg-slate-100 border border-slate-200 px-2.5 py-0.5 text-[11px] font-mono text-slate-700 font-medium">
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

                  {/* Title & Track */}
                  <div className="text-xs font-mono font-bold text-foreground mb-1">
                    {m.title}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mb-3.5 flex items-center gap-1.5">
                    <Icon name="terminal" className="w-3.5 h-3.5 text-muara-ocean shrink-0" />
                    <span className="truncate">{m.track}</span>
                  </div>

                  {/* Bio */}
                  <p className="text-xs text-slate-600 leading-relaxed font-sans mb-5">
                    {m.bio}
                  </p>
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3">
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
        <div className="mt-14 rounded-2xl border border-border bg-slate-50 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="h-12 w-12 rounded-xl bg-muara-sky border border-muara-ocean/30 flex items-center justify-center text-muara-ocean shrink-0 mx-auto sm:mx-0">
              <Icon name="groups" className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-display font-bold text-base text-foreground">
                Direktori Anggota & Roster Lengkap
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Jelajahi seluruh profil kontributor, lead proyek, divisi Builder & Creative, filter spesialisasi track, serta pantau komit aktif komunitas.
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
