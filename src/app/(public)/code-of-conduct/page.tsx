import React from "react";
import Link from "next/link";

export default function CodeOfConductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-muara-cyan hover:underline mb-8"
      >
        <span className="material-symbols-rounded text-sm">arrow_back</span>
        Kembali ke Beranda
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl mb-6">
        Code of Conduct & Etika Rekayasa
      </h1>

      <div className="space-y-8 text-sm leading-relaxed text-slate-300">
        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-muara-cyan">verified</span>
            1. Anti-Slop (Zero Uncurated AI Artifacts)
          </h2>
          <p>
            Muara AI menolak tegas penggunaan AI mentah tanpa kurasi, pengujian, dan evaluasi. 
            Setiap kode, teks, atau media yang dirilis di bawah nama komunitas wajib melalui proses rekayasa 
            berkualitas (TDD, review arsitektur, dan audit visual). Copy-paste output mentah adalah pelanggaran standar.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-muara-cyan">school</span>
            2. Integritas Akademik & Anti-Joki
          </h2>
          <p>
            Muara AI adalah wadah riset dan rekayasa perangkat lunak mandiri. Kami melarang keras segala bentuk 
            jasa joki tugas kampus, pelanggaran integritas akademik, atau komersialisasi pengerjaan ujian. 
            Komunitas ada untuk membimbing praktisi, bukan mengerjakan jalan pintas.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-muara-cyan">lock</span>
            3. Zero Hardcoded Secrets & Keamanan Data
          </h2>
          <p>
            Dilarang keras menyimpan token, API key, atau password langsung ke dalam repositori publik. Seluruh kredensial 
            wajib diisolasi via environment variable dan sistem vault terenkripsi AES-256. Setiap kebocoran kredensial 
            akan ditangani dengan rotasi instan.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6">
          <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
            <span className="material-symbols-rounded text-muara-cyan">commit</span>
            4. Disiplin Git & Testing Mandatori
          </h2>
          <p>
            Setiap perubahan fitur wajib melalui branch terpisah (`feat/...`, `fix/...`), menggunakan format 
            Conventional Commits, dan wajib lolos automated test suite 100% sebelum di-merge ke branch utama.
          </p>
        </section>
      </div>
    </div>
  );
}
