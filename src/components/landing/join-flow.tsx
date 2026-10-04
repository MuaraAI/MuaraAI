import React from "react";
import Link from "next/link";

export default function JoinFlow() {
  const steps = [
    {
      num: "01",
      title: "Login with GitHub",
      desc: "Autentikasi instan menggunakan akun GitHub aktif Anda. Zero password, zero magic link.",
      icon: "login",
    },
    {
      num: "02",
      title: "Kirim Proof of Work",
      desc: "Sertakan tautan repositori proyek open source, karya media terkurasi, dan ringkasan toolchain rekayasa Anda.",
      icon: "upload_file",
    },
    {
      num: "03",
      title: "Undangan Otomatis Organisasi",
      desc: "Saat disetujui maintainer, sistem otomatis mengundang akun Anda bergabung ke GitHub Org github.com/MuaraAI.",
      icon: "mark_email_read",
    },
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-surface-alt/30">
      <div className="mx-auto max-w-7xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
            Alur Pendaftaran
          </h2>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-4">
            3 Langkah Bergabung
          </p>
          <p className="text-sm text-slate-600">
            Tanpa formulir birokrasi berbelit. Kami hanya menilai kualitas artefak kode dan karya rekayasa Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {steps.map((s, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border-ocean bg-white p-8 relative flex flex-col justify-between group hover:border-muara-ocean transition-all shadow-ocean"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="font-display font-bold text-3xl text-slate-300 group-hover:text-muara-ocean transition-colors">
                    {s.num}
                  </span>
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-muara-sky border border-muara-ocean/30 text-muara-ocean">
                    <span className="material-symbols-rounded text-xl">{s.icon}</span>
                  </span>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-xs leading-relaxed text-slate-600">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/api/auth/login"
            className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-8 py-3.5 text-sm font-bold transition-all shadow-ocean"
          >
            <span className="material-symbols-rounded text-lg">arrow_forward</span>
            Mulai Kirim Proof of Work Sekarang
          </Link>
        </div>
      </div>
    </section>
  );
}
