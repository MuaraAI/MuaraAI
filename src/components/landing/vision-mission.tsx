import React from "react";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { Section, SectionHeader } from "@/components/ui/section";

const MISSIONS = [
  "Menghimpun mahasiswa dan praktisi yang menguasai domain AI pada tingkat produksi nyata.",
  "Menegakkan disiplin software engineering: eliminasi AI-slop, TDD mandatori, dan keamanan kredensial.",
  "Menyediakan shared cloud infrastructure (Supabase, Redis, compute) untuk akselerasi riset anggota.",
];

export default function VisionMission() {
  return (
    <Section tone="white">
      <SectionHeader
        eyebrow="Arah & Prinsip"
        title="Visi & Misi Komunitas"
        description="Ke mana MuaraAI melangkah, dan cara kami menjaga kualitasnya di sepanjang jalan."
      />

      <div className="rail rail-wide grid grid-cols-1 gap-8 md:grid-cols-2">
        <FadeIn direction="left" className="h-full p-[2px]">
          <div className="px-card px-card-hover h-full bg-white p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="px-icon h-10 w-10">
                <Icon name="visibility" className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">Visi</h3>
            </div>
            <p className="text-[15px] leading-relaxed text-secondary">
              Menjadi muara ekosistem praktisi dan pengembang AI rekayasa terkemuka dari Kalimantan Barat yang menghasilkan karya berstandar global: independen, berbasis <em>proof-of-work</em>, dan relevan melampaui masa perkuliahan.
            </p>
          </div>
        </FadeIn>

        <FadeIn direction="right" delay={0.1} className="h-full p-[2px]">
          <div className="px-card px-card-hover h-full bg-white p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <span className="px-icon h-10 w-10">
                <Icon name="rocket_launch" className="h-5 w-5" />
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">Misi</h3>
            </div>
            <ul className="space-y-3.5 text-[15px] leading-relaxed text-secondary">
              {MISSIONS.map((mission, idx) => (
                <FadeIn as="li" key={mission} direction="right" distance={14} delay={0.25 + idx * 0.1} className="flex items-start gap-3">
                  <span className="mt-[9px] h-2 w-2 shrink-0 bg-muara-ocean shadow-[2px_2px_0_0_#163A55]" aria-hidden="true" />
                  <span>{mission}</span>
                </FadeIn>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </Section>
  );
}
