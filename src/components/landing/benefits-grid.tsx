import React from "react";

export default function BenefitsGrid() {
  const benefits = [
    {
      icon: "terminal",
      title: "GitHub Org Membership",
      desc: "Akses kolaboratif ke repositori resmi di github.com/MuaraAI dengan branch & review permissions.",
    },
    {
      icon: "menu_book",
      title: "Muara Learn Knowledge Base",
      desc: "Akses materi riset eksklusif, prompt harnesses, system design decks, dan panduan rekayasa internal.",
    },
    {
      icon: "cloud",
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
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
            Mengapa Bergabung?
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            Keuntungan Menjadi Anggota
          </p>
          <p className="text-sm text-slate-400">
            Muara AI dibangun sebagai sarana percepatan karir teknologi dan riset independen.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface p-6 hover:border-muara-cyan/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-cyan/10 border border-muara-cyan/30 text-muara-cyan mb-4">
                  <span className="material-symbols-rounded text-xl">{b.icon}</span>
                </span>
                <h3 className="font-display text-base font-bold text-white mb-2">
                  {b.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-400">
                  {b.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
