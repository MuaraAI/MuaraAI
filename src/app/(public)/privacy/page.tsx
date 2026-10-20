import React from "react";
import { PageHeader } from "@/components/ui/section";

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
            Kami hanya mengumpulkan data yang relevan untuk kebutuhan autentikasi dan kurasi keanggotaan:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Identitas publik GitHub (username, avatar, email publik).</li>
            <li>Nama lengkap, kontak WhatsApp, dan NIM (khusus mahasiswa).</li>
            <li>Tautan portofolio dan deskripsi toolchain rekayasa.</li>
            <li>Riwayat pembayaran iuran kas melalui gateway Pakasir.</li>
          </ul>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Penggunaan & Keamanan Data</h2>
          <p>
            Data Anda tidak pernah diperjualbelikan kepada pihak ketiga mana pun. Kredensial sensitif dienkripsi menggunakan
            standar enkripsi industri AES-256. Autentikasi dikelola secara aman melalui infrastruktur Supabase Auth dengan
            token sesi berbasis HTTP-only cookies.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Hak Akses & Penghapusan</h2>
          <p>
            Anggota berhak memperbarui profil atau meminta penonaktifan akun dan pembersihan data pribadi dengan menghubungi
            maintainer melalui <code>admin@muaraai.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
