import React from "react";

export default function VisionMission() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
            Arah & Prinsip
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Visi & Misi Komunitas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visi */}
          <div className="rounded-xl border border-border bg-surface p-8 relative overflow-hidden group hover:border-muara-cyan/40 transition-colors">
            <div className="absolute top-0 right-0 p-6 text-slate-800 pointer-events-none group-hover:text-muara-cyan/10 transition-colors">
              <span className="material-symbols-rounded text-8xl">explore</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-cyan/10 border border-muara-cyan/30 text-muara-cyan">
                <span className="material-symbols-rounded text-xl">visibility</span>
              </span>
              <h3 className="font-display text-xl font-bold text-white">Visi</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Menjadi muara ekosistem praktisi dan pengembang AI rekayasa terkemuka dari Kalimantan Barat yang menghasilkan karya berstandar global: independen, berbasis <em>proof-of-work</em>, dan relevan melampaui masa perkuliahan.
            </p>
          </div>

          {/* Misi */}
          <div className="rounded-xl border border-border bg-surface p-8 relative overflow-hidden group hover:border-muara-cyan/40 transition-colors">
            <div className="absolute top-0 right-0 p-6 text-slate-800 pointer-events-none group-hover:text-muara-cyan/10 transition-colors">
              <span className="material-symbols-rounded text-8xl">flag</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-cyan/10 border border-muara-cyan/30 text-muara-cyan">
                <span className="material-symbols-rounded text-xl">rocket_launch</span>
              </span>
              <h3 className="font-display text-xl font-bold text-white">Misi</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-300">
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-muara-cyan text-base shrink-0 mt-0.5">check_circle</span>
                <span>Menghimpun mahasiswa dan praktisi yang menguasai domain AI pada tingkat produksi nyata.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-muara-cyan text-base shrink-0 mt-0.5">check_circle</span>
                <span>Menegakkan disiplin software engineering: eliminasi AI-slop, TDD mandatori, dan keamanan kredensial.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="material-symbols-rounded text-muara-cyan text-base shrink-0 mt-0.5">check_circle</span>
                <span>Menyediakan shared cloud infrastructure (Supabase, Redis, compute) untuk akselerasi riset anggota.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
