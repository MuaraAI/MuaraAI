import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import CountUp from "@/components/ui/count-up";
import { Section, SectionHeader } from "@/components/ui/section";

interface TreasuryPreviewProps {
  currentBalance?: number;
  totalExpenses?: number;
}

export default function TreasuryPreview({
  currentBalance = 0,
  totalExpenses = 0,
}: TreasuryPreviewProps) {
  return (
    <Section id="treasury" tone="white">
      <SectionHeader
        eyebrow="Transparansi Keuangan Komunitas"
        title="Open-Book Treasury"
        description="Pengelolaan kas digital otomatis via QRIS Pakasir tanpa struk fisik manual. Seluruh dana dialokasikan untuk infrastruktur cloud dan pendaftaran lomba."
      />

        {/* 2 Clean Indicator Cards */}
        <div className="rail mb-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Card 1: Total Kas Saat Ini */}
          <FadeIn direction="left" className="h-full p-[2px]">
            <div className="px-card px-card-hover group relative h-full overflow-hidden bg-white p-7 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-teal-800">
                  Saldo Kas Bersih Riil
                </span>
                <span className="px-icon h-9 w-9 bg-teal-50 text-teal-700 [--px-line:rgba(13,148,136,.45)]">
                  <Icon name="account_balance_wallet" className="w-5 h-5 text-teal-800" />
                </span>
              </div>
              <div className="font-display font-bold text-3xl sm:text-4xl text-teal-950 tracking-tight mb-2">
                <CountUp value={currentBalance} format="idr" />
              </div>
              <p className="text-sm leading-relaxed text-secondary">
                Total dana kas aktif yang siap dialokasikan untuk pembiayaan riset bersama dan perpanjangan sewa server.
              </p>
            </div>
          </FadeIn>

          {/* Card 2: Total Pengeluaran Kas */}
          <FadeIn direction="right" delay={0.1} className="h-full p-[2px]">
            <div className="px-card px-card-hover group relative h-full overflow-hidden bg-white p-7 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean">
                  Akumulasi Pengeluaran Operasional
                </span>
                <span className="px-icon h-9 w-9">
                  <Icon name="receipt_long" className="w-5 h-5 text-muara-ocean" />
                </span>
              </div>
              <div className="font-display font-bold text-3xl sm:text-4xl text-sky-950 tracking-tight mb-2">
                <CountUp value={totalExpenses} format="idr" />
              </div>
              <p className="text-sm leading-relaxed text-secondary">
                Ringkasan penggunaan kas komunitas untuk kegiatan, tools, dan kebutuhan bersama.
              </p>
            </div>
          </FadeIn>
        </div>

        <FadeIn className="p-[2px]" delay={0.15}>
        <div className="px-frame flex flex-col items-start justify-between gap-4 bg-surface-alt p-5 sm:flex-row sm:items-center sm:p-6">
          <div className="flex items-start gap-3 text-sm leading-relaxed text-secondary sm:items-center">
            <Icon name="info" className="w-5 h-5 text-muara-ocean shrink-0" />
            <span>
              Pembayaran kas QRIS otomatis (Rp 3.000/minggu & Rp 12.000/bulan) serta rincian log mutasi lengkap dapat diakses di dalam Dashboard Member.
            </span>
          </div>
          <Link
            href="/dashboard/treasury"
            className="px-btn-ghost shrink-0 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold"
          >
            Buka Kas Member
            <Icon name="arrow_forward" className="w-4 h-4 text-muara-ocean" />
          </Link>
        </div>
        </FadeIn>
    </Section>
  );
}
