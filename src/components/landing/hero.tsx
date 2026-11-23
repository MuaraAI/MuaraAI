import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import NationalCampusMap from "@/components/landing/national-campus-map";
import HeroHeadline from "@/components/landing/hero-headline";

export default function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-stroke bg-background px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
      <div className="pointer-events-none absolute -right-24 top-12 h-72 w-72 rounded-full bg-sky-100/50 blur-3xl" aria-hidden="true" />
      <div className="mx-auto grid max-w-[100rem] gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center xl:gap-20">
        <div className="relative">
          <FadeIn direction="none">
            <p className="px-chip mb-6 inline-flex items-center gap-2 bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-secondary [--px-line:#CFE2EE]">
              <span className="h-1.5 w-1.5 bg-[#0D9488]" aria-hidden="true" />
              Komunitas mahasiswa lintas kampus<span className="hidden sm:inline"> · lahir di Pontianak</span>
            </p>
          </FadeIn>
          <HeroHeadline />
          <FadeIn delay={0.5} distance={16}>
            <p className="mt-7 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
              MuaraAI adalah ruang kerja mahasiswa dari kampus di seluruh Indonesia untuk belajar, membuat project, dan menunjukkan Proof of Work bersama komunitas.
            </p>
          </FadeIn>
          <FadeIn delay={0.65} distance={16}>
            <div className="mt-9 grid grid-cols-[1fr_auto] gap-3 sm:flex sm:gap-4">
              <Link href="/api/auth/login" className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-sm font-bold sm:px-5">
                Daftar dengan GitHub
                <Icon name="arrow_forward" className="h-4 w-4" />
              </Link>
              <Link href="/members" className="px-btn-ghost inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold sm:px-5">
                Lihat anggota
              </Link>
            </div>
          </FadeIn>
        </div>
        <FadeIn direction="right" delay={0.3} distance={40} className="relative flex w-full items-center justify-end">
          <NationalCampusMap />
        </FadeIn>
      </div>
    </section>
  );
}
