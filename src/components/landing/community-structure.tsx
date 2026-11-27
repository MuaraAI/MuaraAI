import React from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { TIER_NAMES } from "@/lib/contributions/tiers";
import type { PositionsConfig } from "@/lib/positions";

import { RANKS, type Rank } from "@/lib/structure";

const COPY = {
  id: {
    eyebrow: "Struktur",
    title: "Satu komunitas, dua divisi, banyak cara berkontribusi.",
    builder: "Membangun aplikasi, sistem, dan project lewat kode.",
    creative: "Membuat karya, konten, dan ide yang dikerjakan lewat PR di repo org.",
    roles: "Peran",
    rankText: {
      maintainer: "Menjaga arah komunitas dan meninjau pendaftar.",
      head: "Memimpin satu divisi: Head of Builder dan Head of Creative.",
      lead: "Memandu satu bidang kerja di dalam divisi.",
      member: "Berkontribusi lewat PR di repo org dan ikut sesi komunitas.",
    } satisfies Record<Rank, string>,
    tiers: "Tier",
    tiersNote: "Tier dihitung tiap bulan dari kontribusi yang melampaui target. Hanya pengakuan, tanpa hak istimewa.",
  },
  en: {
    eyebrow: "Structure",
    title: "One community, two divisions, many ways to contribute.",
    builder: "Building apps, systems and projects with code.",
    creative: "Making work, content and ideas, delivered as pull requests to the org's repos.",
    roles: "Roles",
    rankText: {
      maintainer: "Keeps the community on course and reviews applicants.",
      head: "Leads a division: Head of Builder and Head of Creative.",
      lead: "Guides one area of work inside a division.",
      member: "Contributes through pull requests to the org's repos and joins community sessions.",
    } satisfies Record<Rank, string>,
    tiers: "Tiers",
    tiersNote: "Tiers are worked out every month from contributions above the target. Recognition only, no perks.",
  },
} as const;

const RANK_NAMES: Record<Rank, string> = { maintainer: "Maintainer", head: "Head", lead: "Lead", member: "Member" };

function Chips({ items }: { items: string[] }) {
  return (
    <ul className="mt-4 flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item} className="px-chip bg-surface-alt px-2.5 py-1 font-mono text-xs font-medium text-foreground">
          {item}
        </li>
      ))}
    </ul>
  );
}

/** Who is who: roles, the two divisions with their positions, and the recognition tiers. */
export default function CommunityStructure({ positions, locale = "id" }: { positions: PositionsConfig | null; locale?: "id" | "en" }) {
  const copy = COPY[locale];
  return (
    <Section id="struktur" tone="white">
      <SectionHeader eyebrow={copy.eyebrow} title={copy.title} />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Builder</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{copy.builder}</p>
            {positions ? <Chips items={positions.builder} /> : null}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Creative</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">{copy.creative}</p>
            {positions ? <Chips items={positions.creative} /> : null}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">{copy.roles}</h3>
            <dl className="mt-4 space-y-3">
              {RANKS.map((rank) => (
                <div key={rank} className="px-frame bg-surface-alt p-3 [--px-line:#CFE2EE]">
                  <dt className="font-mono text-xs font-bold uppercase text-foreground">{RANK_NAMES[rank]}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-secondary">{copy.rankText[rank]}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">{copy.tiers}</h3>
            <Chips items={Object.values(TIER_NAMES)} />
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              {copy.tiersNote}
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
