import React from "react";

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
    <section id="manifesto" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50 bg-surface/20">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
            Standar Kualitas
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-4">
            The Craft Standard (Anti-Slop Manifesto)
          </p>
          <p className="text-sm text-slate-400">
            Di era generative AI, siapa pun bisa menghasilkan teks dan kode dalam hitungan detik. 
            Yang membedakan kami adalah kurasi, evaluasi ketat, dan disiplin rekayasa produksi.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border text-xs font-mono font-bold">
            <div className="p-4 bg-red-950/20 text-red-400 flex items-center gap-2 border-b md:border-b-0 md:border-r border-border">
              <span className="material-symbols-rounded text-base">cancel</span>
              PENGGUNA PASARAN (DITOLAK)
            </div>
            <div className="p-4 bg-muara-cyan/10 text-muara-cyan flex items-center gap-2">
              <span className="material-symbols-rounded text-base">check_circle</span>
              PRAKTISI MUARA AI (STANDAR KAMI)
            </div>
          </div>

          <div className="divide-y divide-border">
            {comparisons.map((c, idx) => (
              <div key={idx} className="grid grid-cols-1 md:grid-cols-2 text-sm">
                <div className="p-5 text-slate-400 bg-background/30 md:border-r border-border flex items-start gap-3">
                  <span className="material-symbols-rounded text-red-400 text-sm mt-0.5 shrink-0">close</span>
                  <span>{c.pasaran}</span>
                </div>
                <div className="p-5 text-slate-200 bg-surface/60 flex items-start gap-3">
                  <span className="material-symbols-rounded text-muara-cyan text-sm mt-0.5 shrink-0">check</span>
                  <span className="font-medium text-white">{c.muara}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
