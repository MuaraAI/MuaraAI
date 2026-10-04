import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";

interface TreasuryPreviewProps {
  currentBalance?: number;
  totalExpenses?: number;
}

export default function TreasuryPreview({
  currentBalance = 0,
  totalExpenses = 0,
}: TreasuryPreviewProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <section id="treasury" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
              Transparansi Keuangan Komunitas
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Open-Book Treasury
            </p>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Pengelolaan kas digital otomatis via QRIS Pakasir tanpa struk fisik manual. Seluruh dana dialokasikan untuk infrastruktur cloud dan pendaftaran lomba.
          </p>
        </div>

        {/* 2 Clean Indicator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Total Kas Saat Ini */}
          <FadeIn delay={0.1}>
            <div className="rounded-xl border border-teal-200 bg-teal-50/40 p-8 relative overflow-hidden group hover:border-teal-500 transition-all shadow-ocean h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800">
                  Saldo Kas Bersih Riil
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-100 border border-teal-300 text-teal-800">
                  <Icon name="account_balance_wallet" className="w-5 h-5 text-teal-800" />
                </span>
              </div>
              <div className="font-display font-bold text-3xl sm:text-4xl text-teal-950 tracking-tight mb-2">
                {formatRupiah(currentBalance)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Total dana kas aktif yang siap dialokasikan untuk pembiayaan riset bersama dan perpanjangan sewa server.
              </p>
            </div>
          </FadeIn>

          {/* Card 2: Total Pengeluaran Kas */}
          <FadeIn delay={0.2}>
            <div className="rounded-xl border border-sky-200 bg-sky-50/40 p-8 relative overflow-hidden group hover:border-muara-ocean transition-all shadow-ocean h-full">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean">
                  Akumulasi Pengeluaran Operasional
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-100 border border-sky-300 text-muara-ocean">
                  <Icon name="receipt_long" className="w-5 h-5 text-muara-ocean" />
                </span>
              </div>
              <div className="font-display font-bold text-3xl sm:text-4xl text-sky-950 tracking-tight mb-2">
                {formatRupiah(totalExpenses)}
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Biaya operasional riil yang telah dibayarkan (sewa VPS Tencent, domain muaraai.com, dan pendaftaran lomba).
              </p>
            </div>
          </FadeIn>
        </div>

        <div className="rounded-xl border border-border-ocean bg-surface-alt p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3 text-slate-700 text-xs">
            <Icon name="info" className="w-5 h-5 text-muara-ocean shrink-0" />
            <span>
              Pembayaran kas QRIS otomatis (Rp 3.000/minggu & Rp 12.000/bulan) serta rincian log mutasi lengkap dapat diakses di dalam Dashboard Member.
            </span>
          </div>
          <Link
            href="/dashboard/treasury"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-white border border-border-ocean px-4 py-2 text-xs font-semibold text-foreground hover:border-muara-ocean transition-colors shadow-sm"
          >
            Buka Kas Member
            <Icon name="arrow_forward" className="w-4 h-4 text-muara-ocean" />
          </Link>
        </div>
      </div>
    </section>
  );
}
