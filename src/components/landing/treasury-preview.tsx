import React from "react";
import Link from "next/link";

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
    <section id="treasury" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
              Transparansi Keuangan Komunitas
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Open-Book Treasury
            </p>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Pengelolaan kas digital otomatis via QRIS Pakasir tanpa struk fisik manual. Seluruh dana dialokasikan untuk infrastruktur cloud dan pendaftaran lomba.
          </p>
        </div>

        {/* 2 Clean Indicator Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Card 1: Total Kas Saat Ini */}
          <div className="rounded-xl border border-border bg-surface p-8 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-emerald-400">
                Saldo Kas Bersih Riil
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <span className="material-symbols-rounded text-lg">account_balance_wallet</span>
              </span>
            </div>
            <div className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">
              {formatRupiah(currentBalance)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Total dana kas aktif yang siap dialokasikan untuk pembiayaan riset bersama dan perpanjangan sewa server.
            </p>
          </div>

          {/* Card 2: Total Pengeluaran Kas */}
          <div className="rounded-xl border border-border bg-surface p-8 relative overflow-hidden group hover:border-muara-cyan/40 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan">
                Akumulasi Pengeluaran Operasional
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muara-cyan/10 border border-muara-cyan/30 text-muara-cyan">
                <span className="material-symbols-rounded text-lg">receipt_long</span>
              </span>
            </div>
            <div className="font-display font-bold text-3xl sm:text-4xl text-white tracking-tight mb-2">
              {formatRupiah(totalExpenses)}
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Biaya operasional riil yang telah dibayarkan (sewa VPS Tencent, domain muaraai.com, dan pendaftaran lomba).
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface/40 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-300 text-xs">
            <span className="material-symbols-rounded text-muara-cyan text-xl">info</span>
            <span>
              Pembayaran kas QRIS otomatis (Rp 3.000/minggu & Rp 12.000/bulan) serta rincian log mutasi lengkap dapat diakses di dalam Dashboard Member.
            </span>
          </div>
          <Link
            href="/dashboard/treasury"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg bg-surface-hover border border-border px-4 py-2 text-xs font-semibold text-white hover:border-muara-cyan transition-colors"
          >
            Buka Kas Member
            <span className="material-symbols-rounded text-sm">arrow_forward</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
