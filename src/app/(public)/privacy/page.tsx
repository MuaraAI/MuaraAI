import React from "react";
import Link from "next/link";

export default function PrivacyPage() {
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
        Privacy Policy (Kebijakan Privasi)
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-slate-300">
        <p>
          Kebijakan privasi ini menjelaskan bagaimana Muara AI mengelola dan melindungi data pribadi yang Anda berikan saat
          menggunakan portal <strong>muaraai.com</strong>.
        </p>

        <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">1. Data yang Dikumpulkan</h2>
          <p>
            Kami hanya mengumpulkan data yang relevan untuk kebutuhan autentikasi dan kurasi keanggotaan:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-400">
            <li>Identitas publik GitHub (username, avatar, email publik).</li>
            <li>Nama lengkap, kontak WhatsApp, dan NIM (khusus mahasiswa).</li>
            <li>Tautan portofolio dan deskripsi toolchain rekayasa.</li>
            <li>Riwayat pembayaran iuran kas melalui gateway Pakasir.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">2. Penggunaan & Keamanan Data</h2>
          <p>
            Data Anda tidak pernah diperjualbelikan kepada pihak ketiga mana pun. Kredensial sensitif dienkripsi menggunakan
            standar enkripsi industri AES-256. Autentikasi dikelola secara aman melalui infrastruktur Supabase Auth dengan
            token sesi berbasis HTTP-only cookies.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-surface p-6 space-y-3">
          <h2 className="text-base font-semibold text-white">3. Hak Akses & Penghapusan</h2>
          <p>
            Anggota berhak memperbarui profil atau meminta penonaktifan akun dan pembersihan data pribadi dengan menghubungi
            maintainer melalui <code>admin@muaraai.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
