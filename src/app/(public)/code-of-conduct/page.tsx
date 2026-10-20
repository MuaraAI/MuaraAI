import React from "react";
import Icon from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/section";

export default function CodeOfConductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader eyebrow="Legal" title="Code of Conduct & Etika Rekayasa" description="Norma dan etika yang kami pegang saat belajar dan membangun bersama." />

      <div className="stagger-rise space-y-8 text-sm leading-relaxed text-slate-600">
        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="verified" className="w-5 h-5 text-muara-ocean" />
            1. Anti-Slop (Zero Uncurated AI Artifacts)
          </h2>
          <p>
            Muara AI menolak tegas penggunaan AI mentah tanpa kurasi, pengujian, dan evaluasi. 
            Setiap kode, teks, atau media yang dirilis di bawah nama komunitas wajib melalui proses rekayasa 
            berkualitas (TDD, review arsitektur, dan audit visual). Copy-paste output mentah adalah pelanggaran standar.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="school" className="w-5 h-5 text-muara-ocean" />
            2. Integritas Akademik & Anti-Joki
          </h2>
          <p>
            Muara AI adalah wadah riset dan rekayasa perangkat lunak mandiri. Kami melarang keras segala bentuk 
            jasa joki tugas kampus, pelanggaran integritas akademik, atau komersialisasi pengerjaan ujian. 
            Komunitas ada untuk membimbing praktisi, bukan mengerjakan jalan pintas.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="lock" className="w-5 h-5 text-muara-ocean" />
            3. Zero Hardcoded Secrets & Keamanan Data
          </h2>
          <p>
            Dilarang keras menyimpan token, API key, atau password langsung ke dalam repositori publik. Seluruh kredensial 
            wajib diisolasi via environment variable. Setiap kebocoran kredensial
            akan ditangani dengan rotasi instan.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="commit" className="w-5 h-5 text-muara-ocean" />
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
