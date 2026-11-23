import React from "react";
import Icon, { IconName } from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import SpotlightCard from "@/components/ui/spotlight-card";
import { Section, SectionHeader } from "@/components/ui/section";

// 3 cards per row on a 6-col grid; an unfinished last row stretches so no gap is left.
function spanFor(idx: number, total: number) {
  const remainder = total % 3;
  if (remainder === 0 || idx < total - remainder) return "md:col-span-2";
  return remainder === 2 ? "md:col-span-3" : "md:col-span-6";
}

export default function BenefitsGrid() {
  const benefits: { icon: IconName; title: string; desc: string }[] = [
    {
      icon: "terminal",
      title: "GitHub Org Membership",
      desc: "Akses kolaboratif ke repositori resmi di github.com/MuaraAI dengan branch & review permissions.",
    },
    {
      icon: "upload_file",
      title: "Muara Learn Knowledge Base",
      desc: "Akses materi riset eksklusif, prompt harnesses, system design decks, dan panduan rekayasa internal.",
    },
    {
      icon: "hub",
      title: "Shared Compute & API Keys",
      desc: "Subsidi kuota compute, akses AI API gateway, dan infrastruktur cloud bersama untuk riset mandiri.",
    },
    {
      icon: "trophy",
      title: "Dukungan Kompetisi & Lomba",
      desc: "Biaya registrasi hackathon, Gemastik, dan ajang teknologi nasional didukung penuh oleh kas komunitas.",
    },
    {
      icon: "badge",
      title: "Verified Portfolio Showcase",
      desc: "Profil dan portofolio karya terpajang resmi di domain muaraai.com sebagai bukti keahlian industri.",
    },
  ];

  return (
    <Section tone="tint">
      <SectionHeader
        eyebrow="Mengapa Bergabung?"
        title="Keuntungan Menjadi Anggota"
        description="Muara AI dibangun sebagai sarana percepatan karir teknologi dan riset independen."
      />

        <div className="rail grid grid-cols-1 gap-8 md:grid-cols-6">
          {benefits.map((b, idx) => (
            <FadeIn key={idx} delay={(idx % 3) * 0.1} className={`h-full p-[2px] ${spanFor(idx, benefits.length)}`}>
              <SpotlightCard
                className="px-card px-card-hover flex h-full flex-col justify-between bg-white p-6 sm:p-7"
              >
                <div>
                  <span className="px-icon h-10 w-10 mb-5">
                    <Icon name={b.icon} className="w-5 h-5 text-muara-ocean" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    {b.desc}
                  </p>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
    </Section>
  );
}
