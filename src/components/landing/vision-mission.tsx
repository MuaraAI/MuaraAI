import React from "react";
import Icon from "@/components/ui/icon";

export default function VisionMission() {
  return (
    <section className="py-16 md:py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Arah & Prinsip
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Visi & Misi Komunitas
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Visi */}
          <div className="rounded-xl border border-border-ocean bg-surface p-8 relative overflow-hidden group hover:border-muara-ocean transition-all shadow-ocean">
            <div className="absolute top-0 right-0 p-6 text-slate-100 pointer-events-none group-hover:text-sky-100/70 transition-colors">
              <Icon name="explore" className="w-24 h-24 text-slate-100" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-sky border border-muara-ocean/30 text-muara-ocean">
                <Icon name="visibility" className="w-5 h-5 text-muara-ocean" />
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">Visi</h3>
            </div>
            <p className="text-sm leading-relaxed text-slate-600">
              Menjadi muara ekosistem praktisi dan pengembang AI rekayasa terkemuka dari Kalimantan Barat yang menghasilkan karya berstandar global: independen, berbasis <em>proof-of-work</em>, dan relevan melampaui masa perkuliahan.
            </p>
          </div>

          {/* Misi */}
          <div className="rounded-xl border border-border-ocean bg-surface p-8 relative overflow-hidden group hover:border-muara-ocean transition-all shadow-ocean">
            <div className="absolute top-0 right-0 p-6 text-slate-100 pointer-events-none group-hover:text-sky-100/70 transition-colors">
              <Icon name="rocket_launch" className="w-24 h-24 text-slate-100" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-sky border border-muara-ocean/30 text-muara-ocean">
                <Icon name="rocket_launch" className="w-5 h-5 text-muara-ocean" />
              </span>
              <h3 className="font-display text-xl font-bold text-foreground">Misi</h3>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-muara-ocean shrink-0 mt-0.5" />
                <span>Menghimpun mahasiswa dan praktisi yang menguasai domain AI pada tingkat produksi nyata.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-muara-ocean shrink-0 mt-0.5" />
                <span>Menegakkan disiplin software engineering: eliminasi AI-slop, TDD mandatori, dan keamanan kredensial.</span>
              </li>
              <li className="flex items-start gap-2">
                <Icon name="check_circle" className="w-4 h-4 text-muara-ocean shrink-0 mt-0.5" />
                <span>Menyediakan shared cloud infrastructure (Supabase, Redis, compute) untuk akselerasi riset anggota.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
