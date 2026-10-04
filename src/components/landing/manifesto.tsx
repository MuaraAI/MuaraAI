import React from "react";
import Icon from "@/components/ui/icon";

export default function Manifesto() {
  const comparisons = [
    {
      pasaran: "Prompt mentah sekali lempar lalu terima apa adanya tanpa uji coba.",
      muara: "Agentic IDE harness (Cursor, Hermes, Claude Code) dengan context files ketat.",
    },
    {
      pasaran: "Banjir teks dan kode halusinatorik (AI-slop) yang langsung di-push ke publik.",
      muara: "Test-Driven Development (TDD) mandatori. Output diuji 100% sebelum dirilis.",
    },
    {
      pasaran: "Kredensial, API key, dan password bocor terang-terangan di git commit.",
      muara: "Multi-tenant vault AES-256-GCM, environment variables aman, zero secrets.",
    },
    {
      pasaran: "Organisasi seremonial: banyak rapat, banyak gelar fungsional, nol kode.",
      muara: "Meritokrasi 4 lapis berdasar Proof of Work nyata dan kontribusi commit.",
    },
  ];

  return (
    <section id="manifesto" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-stroke bg-surface-alt/40">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Standar Kualitas
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            The Craft Standard (Anti-Slop Manifesto)
          </p>
          <p className="text-sm text-secondary font-sans">
            Di era generative AI, siapa pun bisa menghasilkan teks dan kode dalam hitungan detik. 
            Yang membedakan kami adalah kurasi, evaluasi ketat, dan disiplin rekayasa produksi.
          </p>
        </div>

        <div className="rounded-[18px] border border-stroke bg-white overflow-hidden shadow-diffusion">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-stroke text-xs font-mono font-bold">
            <div className="p-4 bg-rose-50 text-rose-800 flex items-center gap-2 border-b md:border-b-0 md:border-r border-stroke">
              <Icon name="cancel" className="w-4 h-4 text-rose-700" />
              <span>PENGGUNA PASARAN (DITOLAK)</span>
            </div>
            <div className="p-4 bg-sky-50 text-muara-ocean flex items-center gap-2">
              <Icon name="check_circle" className="w-4 h-4 text-muara-ocean" />
              <span>PRAKTISI MUARA AI (STANDAR KAMI)</span>
            </div>
          </div>

          <div className="divide-y divide-stroke">
            {comparisons.map((c, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 text-sm font-sans">
                <div className="p-5 text-secondary bg-slate-50/50 md:border-r border-stroke flex items-start gap-3">
                  <Icon name="close" className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{c.pasaran}</span>
                </div>
                <div className="p-5 text-foreground bg-white flex items-start gap-3">
                  <Icon name="check" className="w-4 h-4 text-muara-ocean shrink-0 mt-0.5" />
                  <span className="font-medium text-foreground">{c.muara}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
