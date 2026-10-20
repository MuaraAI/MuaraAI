import React from "react";
import { PageHeader } from "@/components/ui/section";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader eyebrow="Legal" title="Terms of Service (Ketentuan Layanan)" description="Aturan main penggunaan platform dan keanggotaan Muara AI." />

      <div className="stagger-rise space-y-6 text-sm leading-relaxed text-slate-600">
        <p>
          Selamat datang di platform resmi <strong>Muara AI</strong> (muaraai.com). Dengan mengakses dan menggunakan layanan,
          Anda menyetujui ketentuan meritokrasi dan regulasi komunitas kami berikut ini:
        </p>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Keanggotaan & Proof of Work</h2>
          <p>
            Penerimaan anggota ditentukan sepenuhnya berdasarkan orisinalitas dan kualitas Proof of Work (karya nyata / portofolio).
            Muara AI berhak menolak atau mencabut status keanggotaan apabila ditemukan kecurangan, plagiarisme, atau pelanggaran etika.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Sistem Iuran Kas Komunitas</h2>
          <p>
            Iuran kas sebesar Rp 3.000 / minggu atau Rp 12.000 / bulan digunakan secara transparan untuk pembiayaan sewa server VPS,
            domain, kuota API compute, dan registrasi kompetisi. Anggota yang menunggak lebih dari 30 hari berturut-turut akan
            dinonaktifkan hak akses API dan repositori internalnya hingga tunggakan diselesaikan.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
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
