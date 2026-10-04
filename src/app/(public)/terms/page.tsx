import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-mono text-muara-ocean hover:underline mb-8"
      >
        <Icon name="arrow_back" className="w-4 h-4 text-muara-ocean" />
        Kembali ke Beranda
      </Link>

      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl mb-6">
        Terms of Service (Ketentuan Layanan)
      </h1>

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          Selamat datang di platform resmi <strong>Muara AI</strong> (muaraai.com). Dengan mengakses dan menggunakan layanan,
          Anda menyetujui ketentuan meritokrasi dan regulasi komunitas kami berikut ini:
        </p>

        <section className="rounded-xl border border-border-ocean bg-white p-6 space-y-3 shadow-ocean">
          <h2 className="text-base font-semibold text-foreground">1. Keanggotaan & Proof of Work</h2>
          <p>
            Penerimaan anggota ditentukan sepenuhnya berdasarkan orisinalitas dan kualitas Proof of Work (karya nyata / portofolio).
            Muara AI berhak menolak atau mencabut status keanggotaan apabila ditemukan kecurangan, plagiarisme, atau pelanggaran etika.
          </p>
        </section>

        <section className="rounded-xl border border-border-ocean bg-white p-6 space-y-3 shadow-ocean">
          <h2 className="text-base font-semibold text-foreground">2. Sistem Iuran Kas Komunitas</h2>
          <p>
            Iuran kas sebesar Rp 3.000 / minggu atau Rp 12.000 / bulan digunakan secara transparan untuk pembiayaan sewa server VPS,
            domain, kuota API compute, dan registrasi kompetisi. Anggota yang menunggak lebih dari 30 hari berturut-turut akan
            dinonaktifkan hak akses API dan repositori internalnya hingga tunggakan diselesaikan.
          </p>
        </section>

        <section className="rounded-xl border border-border-ocean bg-white p-6 space-y-3 shadow-ocean">
          <h2 className="text-base font-semibold text-foreground">3. Kekayaan Intelektual & Open Source</h2>
          <p>
            Proyek bersama komunitas dirilis di bawah lisensi resmi sumber terbuka (MIT License). Anggota tetap memiliki hak moral
            atas kode dan karya cipta yang disumbangkan.
          </p>
        </section>
      </div>
    </div>
  );
}
