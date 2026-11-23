"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { Section, SectionHeader } from "@/components/ui/section";
import { communityContent } from "@/lib/community-content";

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

const TITLE_STYLES: Record<"Founder" | "Co-Founder", React.CSSProperties> = {
  Founder: { color: "#92400E", backgroundColor: "#FEF3C7", ["--px-line" as string]: "#D97706" },
  "Co-Founder": { color: "#075985", backgroundColor: "#FFFFFF", ["--px-line" as string]: "#0369A1" },
};

// Role chips stay inside the Fluid Currents palette: ink, river blue, teal, amber, indigo.
const ROLE_STYLES: Record<string, { fg: string; bg: string }> = {
  Maintainer: { fg: "#163A55", bg: "#EEF3F7" },
  Builder: { fg: "#075985", bg: "#E6F1F8" },
  "AI Engineer": { fg: "#0F766E", bg: "#E6F6F4" },
  Desainer: { fg: "#B45309", bg: "#FDF3E3" },
  Backend: { fg: "#4338CA", bg: "#EEEDFD" },
};

const WAVE = [2, 3, 3, 4, 4, 3, 3, 2];

/** Tiny pixel-art estuary: stepped sky, clouds, and an 8px wave tile that scrolls on hover. */
function PixelEstuary({ seed }: { seed: number }) {
  const cloudX = [12, 46, 70][seed % 3];
  const columns = Array.from({ length: 104 }, (_, x) => x);
  return (
    <svg viewBox="0 0 96 24" preserveAspectRatio="xMidYMid slice" shapeRendering="crispEdges" className="absolute inset-0 h-full w-full" aria-hidden="true">
      <rect width="96" height="24" fill="#EEF6FB" />
      <rect width="96" height="8" fill="#DCEBF5" />
      <rect y="8" width="96" height="5" fill="#E6F1F8" />
      <g fill="#FFFFFF">
        <rect x={cloudX} y="4" width="8" height="2" />
        <rect x={cloudX + 2} y="3" width="4" height="1" />
        <rect x={(cloudX + 38) % 90} y="8" width="6" height="2" />
        <rect x={(cloudX + 39) % 90} y="7" width="3" height="1" />
      </g>
      <rect x="84" y="3" width="4" height="4" fill="#FCD34D" />
      <g className="px-water">
        {columns.map((x) => {
          const h = WAVE[(x + seed * 3) % 8];
          const low = Math.max(1, h - 2);
          return (
            <g key={x}>
              <rect x={x} y={19 - h} width="1" height={h + 5} fill="#9CC6E0" />
              <rect x={x} y={21 - low} width="1" height={low + 3} fill="#5FA3CC" />
            </g>
          );
        })}
      </g>
      <rect y="22" width="96" height="2" fill="#0369A1" />
    </svg>
  );
}

const CORE_MAINTAINERS = communityContent.coreMaintainers.map((member) => ({
  githubUsername: member.github,
  fullName: member.name,
  nim: member.nim,
  title: member.title,
  roleBadge: member.title as "Founder" | "Co-Founder",
  division: member.division.toLowerCase() as "builder" | "creative",
  roles: [...member.roles] as string[],
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
    <Section id="syndicate" tone="white">
      <SectionHeader
        eyebrow="Dewan Pengarah & Inisiator"
        title="Tim inti MuaraAI"
        description="Founder dan maintainer yang memulai MuaraAI dari UBSI Pontianak dan membangun komunitasnya bersama mahasiswa UBSI."
      />

        {/* Core team cards: pixel-art edition */}
        <div className="rail grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {maintainers.map((m, idx) => (
            <FadeIn
              key={m.id}
              delay={idx * 0.12}
              distance={36}
              // On the 2-column tablet grid an odd last card stretches full width instead of leaving a hole.
              className={`h-full p-[2px] ${
                idx === maintainers.length - 1 && maintainers.length % 2 === 1
                  ? "md:col-span-2 lg:col-span-1"
                  : ""
              }`}
            >
              <article className="group px-card px-card-hover relative flex h-full flex-col bg-white">
                {/* Pixel estuary cover */}
                <div className="relative h-24 overflow-hidden border-b-2 border-[#163A55]">
                  <PixelEstuary seed={idx} />
                  <span className="absolute left-3 top-3 bg-[#163A55] px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-[0.15em] text-white">
                    P{idx + 1}
                  </span>
                  <span
                    className="px-chip absolute right-4 top-3.5 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider"
                    style={TITLE_STYLES[m.roleBadge === "Founder" ? "Founder" : "Co-Founder"]}
                  >
                    {m.roleBadge}
                  </span>
                </div>

                {/* Body */}
                <div className="relative flex flex-1 flex-col px-6 pb-6">
                  <div className="px-frame relative -mt-10 h-[72px] w-[72px] overflow-hidden bg-[#DCEBF5] transition-[box-shadow] duration-300 group-hover:[--px-line:#0369A1]">
                    <Image
                      src={m.avatarUrl}
                      alt={m.fullName}
                      width={144}
                      height={144}
                      className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                      unoptimized
                    />
                  </div>

                  <h3 className="mt-5 font-display text-lg font-bold leading-snug text-foreground">
                    {m.fullName}
                  </h3>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 font-mono text-xs text-secondary">
                    <span>@{m.githubUsername}</span>
                    <span className="h-1 w-1 bg-secondary/40" aria-hidden="true" />
                    <span>NIM {m.nim}</span>
                  </p>

                  <p className="mb-3 mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70">
                    Peran
                  </p>
                  <ul className="flex flex-wrap gap-2.5" aria-label={`Peran ${m.fullName}`}>
                    {m.roles.map((role) => {
                      const tone = ROLE_STYLES[role] ?? ROLE_STYLES.Maintainer;
                      return (
                        <li
                          key={role}
                          className="px-chip inline-flex items-center gap-1.5 px-2 py-0.5 font-mono text-[11px] font-semibold"
                          style={{ color: tone.fg, backgroundColor: tone.bg, ["--px-line" as string]: `color-mix(in srgb, ${tone.fg} 45%, transparent)` }}
                        >
                          <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
                          {role}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Footer */}
                  <div className="mt-auto pt-6">
                    <div className="flex items-center justify-between gap-3 border-t-2 border-dashed border-[#CFE2EE] pt-4">
                      <Link
                        href={m.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group/link -mx-2 inline-flex min-h-9 items-center gap-2 px-2 font-mono text-xs font-semibold text-secondary transition-colors duration-200 hover:bg-[#163A55] hover:text-white"
                      >
                        <Icon name="github" className="h-4 w-4" />
                        <span>github.com/{m.githubUsername}</span>
                        <Icon name="arrow_forward" className="h-3.5 w-3.5 transition-transform duration-200 [transition-timing-function:steps(2,end)] group-hover/link:translate-x-1" />
                      </Link>
                      {m.linkedinUrl && (
                        <Link
                          href={m.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-secondary transition-colors duration-200 hover:bg-[#163A55] hover:text-white"
                          aria-label={`${m.fullName} LinkedIn`}
                        >
                          <Icon name="public" className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            </FadeIn>
          ))}
        </div>

        {/* Navigation Banner to Full Member Directory */}
        <FadeIn className="mt-14 p-[2px]" delay={0.1}>
          <div className="px-frame flex flex-col items-center justify-between gap-6 bg-surface-alt p-6 sm:flex-row sm:p-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
              <div className="px-icon h-12 w-12 shrink-0">
                <Icon name="group" className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-display text-base font-bold text-foreground">
                  Direktori Anggota & Roster Lengkap
                </h4>
                <p className="mt-1 max-w-xl font-sans text-xs text-secondary">
                  Jelajahi profil mahasiswa UBSI, kampus, kelas, prodi, divisi, dan kontribusi yang tampil secara faktual.
                </p>
              </div>
            </div>

            <Link
              href="/members"
              className="px-btn inline-flex w-full shrink-0 items-center justify-center gap-2 px-4 py-3 font-mono text-xs font-bold sm:w-auto"
            >
              <span className="text-center">Lihat Direktori Seluruh Anggota</span>
              <Icon name="arrow_forward" className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
    </Section>
  );
}
