"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { Section, SectionHeader } from "@/components/ui/section";
import { isMaintainer } from "@/lib/guards";
import { DIVISION_NAMES, divisionsOf, headOf, isDivision, roleBadges } from "@/lib/structure";

export type RosterFilter =
  | "maintainer"
  | "lead"
  | "head"
  | "creative"
  | "builder"
  | "cybersecurity"
  | "top-tier"
  | "all";

export function filterMembers(members: Member[], filter: RosterFilter): Member[] {
  if (filter === "top-tier") {
    return members
      .filter((m) => (m.tier || 0) > 0)
      .sort((a, b) => (b.tier || 0) - (a.tier || 0) || (b.streak || 0) - (a.streak || 0) || a.full_name.localeCompare(b.full_name));
  }
  // One rule per filter. "Maintainer" follows isMaintainer (the same rule the database uses for access).
  if (filter === "maintainer") return members.filter((m) => isMaintainer(m));
  if (filter === "head") return members.filter((m) => headOf(m).length > 0 || m.hierarchy === "head");
  if (filter === "lead") return members.filter((m) => m.hierarchy === "lead");
  if (isDivision(filter)) return members.filter((m) => divisionsOf(m).includes(filter));
  return members;
}

interface SyndicateRosterProps {
  initialMembers?: Member[];
}

const TITLE_STYLES: Record<"Founder" | "Co-Founder", React.CSSProperties> = {
  Founder: { color: "#92400E", backgroundColor: "#FEF3C7", ["--px-line" as string]: "#D97706" },
  "Co-Founder": { color: "#075985", backgroundColor: "#FFFFFF", ["--px-line" as string]: "#0369A1" },
};

function ChipList({ label, title, items }: { label: string; title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <>
      <p className="mb-3 mt-5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-secondary/70">{title}</p>
      <ul className="flex flex-wrap gap-2.5" aria-label={label}>
        {items.map((item) => (
          <li key={item} className="px-chip inline-flex items-center gap-1.5 bg-[#EEF3F7] px-2 py-0.5 font-mono text-[11px] font-semibold text-[#163A55]">
            <span className="h-1.5 w-1.5 bg-current" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </>
  );
}

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

const honorificOf = (member: Member) => roleBadges(member)[0];
const HONORIFIC_RANK: Record<string, number> = { Founder: 0, "Co-Founder": 1 };

/** The maintainers, straight from the members table: founders first, then co-founders, then by name. */
export function coreTeam(members: Member[]): Member[] {
  const rank = (member: Member) => HONORIFIC_RANK[honorificOf(member) ?? ""] ?? 2;
  return members.filter((member) => isMaintainer(member)).sort((a, b) => rank(a) - rank(b) || a.full_name.localeCompare(b.full_name));
}

export default function SyndicateRoster({ initialMembers = [] }: SyndicateRosterProps) {
  const maintainers = coreTeam(initialMembers).map((member) => {
    const badges = roleBadges(member);
    const honorific = HONORIFIC_RANK[badges[0] ?? ""] !== undefined ? badges[0] : "Maintainer";
    return {
      id: member.id,
      fullName: member.full_name,
      githubUsername: member.github_username,
      honorific,
      roles: badges.filter((badge) => badge !== honorific),
      divisions: divisionsOf(member).map((division) => DIVISION_NAMES[division]),
      tracks: member.tracks ?? [],
      avatarUrl: member.avatar_url || `https://github.com/${member.github_username}.png`,
      githubUrl: member.github_url || `https://github.com/${member.github_username}`,
      linkedinUrl: member.linkedin_url,
    };
  });

  if (maintainers.length === 0) return null;

  return (
    <Section id="syndicate" tone="white">
      <SectionHeader
        eyebrow="Dewan Pengarah & Inisiator"
        title="Tim inti MuaraAI"
        description="Founder dan maintainer yang memulai MuaraAI di Pontianak dan membangun komunitasnya bersama anggota dari berbagai latar belakang."
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
                    style={TITLE_STYLES[m.honorific === "Founder" ? "Founder" : "Co-Founder"]}
                  >
                    {m.honorific}
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
                  </p>

                  <ChipList label={`Peran ${m.fullName}`} title="Peran" items={m.roles} />
                  <ChipList label={`Divisi ${m.fullName}`} title="Anggota divisi" items={m.divisions} />
                  <ChipList label={`Posisi ${m.fullName}`} title="Posisi" items={m.tracks} />

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
                  Jelajahi profil anggota, institusi, divisi, posisi, dan kontribusi yang tampil secara faktual.
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
