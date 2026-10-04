import React from "react";
import Icon, { IconName } from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import SpotlightCard from "@/components/ui/spotlight-card";

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
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface-alt/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Mengapa Bergabung?
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            Keuntungan Menjadi Anggota
          </p>
          <p className="text-sm text-slate-600">
            Muara AI dibangun sebagai sarana percepatan karir teknologi dan riset independen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, idx) => (
            <FadeIn key={idx} delay={idx * 0.1}>
              <SpotlightCard
                className="rounded-xl border border-border-ocean bg-white p-6 hover:border-muara-ocean transition-all flex flex-col justify-between shadow-ocean h-full"
              >
                <div>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-sky border border-muara-ocean/30 text-muara-ocean mb-4">
                    <Icon name={b.icon} className="w-5 h-5 text-muara-ocean" />
                  </span>
                  <h3 className="font-display text-base font-bold text-foreground mb-2">
                    {b.title}
                  </h3>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {b.desc}
                  </p>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
