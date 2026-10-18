import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import NationalCampusMap from "@/components/landing/national-campus-map";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stroke bg-background px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24 lg:px-8">
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div className="relative">
          <h1 className="max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl">
            Belajar, membangun,
            <br />
            <span className="text-muara-ocean">berkontribusi.</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-relaxed text-secondary sm:text-lg">
            MuaraAI adalah ruang kerja mahasiswa dari kampus di seluruh Indonesia untuk belajar, membuat project, dan menunjukkan Proof of Work bersama komunitas.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link href="/api/auth/login" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-foreground px-5 py-3 text-sm font-bold text-white shadow-diffusion transition-colors hover:bg-secondary">
              Daftar dengan GitHub
              <Icon name="arrow_forward" className="h-4 w-4" />
            </Link>
            <Link href="/members" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md border border-stroke bg-white px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:border-muara-ocean hover:bg-surface-alt">
              Lihat anggota
            </Link>
          </div>
        </div>
        <div className="relative min-h-[320px] lg:min-h-[390px]">
          <NationalCampusMap />
        </div>
      </div>
    </section>
  );
}
