import React from "react";
import { PageHeader } from "@/components/ui/section";

import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://muaraai.com/privacy",
    languages: { id: "https://muaraai.com/privacy", en: "https://muaraai.com/en/privacy", "x-default": "https://muaraai.com/privacy" },
  },
};


export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader eyebrow="Legal" title="Privacy Policy (Kebijakan Privasi)" description="Cara Muara AI mengelola dan melindungi data yang Anda berikan." />

      <div className="stagger-rise space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          Kebijakan privasi ini menjelaskan bagaimana Muara AI mengelola dan melindungi data pribadi yang Anda berikan saat
          menggunakan portal <strong>muaraai.com</strong>.
        </p>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Data yang Dikumpulkan</h2>
          <p>
            Kami hanya mengumpulkan data yang relevan untuk autentikasi, kurasi keanggotaan, dan penghitungan kontribusi:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Identitas publik GitHub (username, avatar, email publik).</li>
            <li>Nama lengkap, status (mahasiswa, pelajar, umum, atau lainnya), institusi (opsional), nomor WhatsApp, dan username Telegram (opsional).</li>
            <li>Alasan bergabung yang kamu tulis.</li>
            <li>Tautan portofolio dan deskripsi toolchain rekayasa.</li>
            <li>
              Aktivitas GitHub kamu di org MuaraAI: pull request yang di-merge, review yang menyetujuinya, jumlah commit di dalam pull request itu, dan repo
              yang kamu buat. Data ini dipakai untuk menghitung target kontribusi bulanan.
            </li>
            <li>Kehadiran sesi Discord yang kamu catat lewat check-in di web.</li>
          </ul>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Siapa yang Dapat Melihat Datamu</h2>
          <p>
            Profil anggota yang sudah disetujui bersifat publik dan tampil di direktori anggota: nama lengkap, avatar dan username GitHub, divisi dan posisi,
            status, institusi (jika diisi), tautan yang kamu isi, serta tier, streak, total commit kumulatif, dan status keanggotaan (aktif atau tidak, tanggal mulai dan keluar).
          </p>
          <p>
            Hanya kamu dan maintainer yang dapat melihat email, nomor WhatsApp, username Telegram, alasan bergabung, deskripsi toolchain, angka kontribusi bulanan per bulan, status
            peringatan, dan kehadiran sesi Discord.
          </p>
          <p>
            Saat kamu mendaftar, ringkasan pendaftaran (nama, status, institusi, username GitHub, divisi dan track, tautan portofolio, dan cuplikan alasan bergabung)
            dikirim ke maintainer lewat email dan kanal Discord.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Penggunaan & Keamanan Data</h2>
          <p>
            Data Anda tidak pernah diperjualbelikan kepada pihak ketiga mana pun. Data disimpan dan diautentikasi lewat Supabase (database dan Supabase
            Auth, dengan token sesi berbasis HTTP-only cookies), situs dijalankan di Vercel, email dikirim lewat Resend, login dan aktivitas kontribusi
            dibaca dari GitHub, dan notifikasi untuk maintainer dikirim lewat Discord. Kolom data pribadi dibatasi di tingkat database sehingga tidak dapat
            dibaca publik.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Hak Akses & Penghapusan</h2>
          <p>
            Anggota berhak memperbarui profil atau meminta penonaktifan akun dan pembersihan data pribadi dengan menghubungi
            maintainer melalui <code>admin@muaraai.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
