import React from "react";
import { Section, SectionHeader } from "@/components/ui/section";
import { TIER_NAMES } from "@/lib/contributions/tiers";
import type { PositionsConfig } from "@/lib/positions";

const ROLES = ["Maintainer", "Head", "Lead", "Member"];

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
export default function CommunityStructure({ positions }: { positions: PositionsConfig | null }) {
  return (
    <Section id="struktur" tone="white">
      <SectionHeader eyebrow="Struktur" title="Satu komunitas, dua divisi, banyak cara berkontribusi." />

      <div className="grid gap-12 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-10 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Builder</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">Membangun aplikasi, sistem, dan project lewat kode.</p>
            {positions ? <Chips items={positions.builder} /> : null}
          </div>
          <div>
            <h3 className="font-display text-xl font-bold text-foreground">Creative</h3>
            <p className="mt-2 text-sm leading-relaxed text-secondary">Membuat karya, konten, dan ide yang dikerjakan lewat PR di repo org.</p>
            {positions ? <Chips items={positions.creative} /> : null}
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Peran</h3>
            <Chips items={ROLES} />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-foreground">Tier</h3>
            <Chips items={Object.values(TIER_NAMES)} />
            <p className="mt-3 text-sm leading-relaxed text-secondary">
              Tier dihitung tiap bulan dari kontribusi yang melampaui target. Hanya pengakuan, tanpa hak istimewa.
            </p>
          </div>
        </div>
      </div>
    </Section>
  );
}
