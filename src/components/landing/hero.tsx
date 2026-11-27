import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import HeroHeadline from "@/components/landing/hero-headline";
import HeroShowcase, { type HeroStats } from "@/components/landing/hero-showcase";

export default function Hero({ stats, signedIn = false }: { stats?: HeroStats; signedIn?: boolean }) {
  return (
    <section className="border-b border-stroke bg-background px-4 pb-16 pt-12 sm:px-6 md:pb-24 md:pt-20 lg:px-8">
      <div className="mx-auto grid max-w-[100rem] items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div>
        <HeroHeadline />
        <p className="mt-7 max-w-xl text-base leading-relaxed text-secondary sm:text-lg">
          Komunitas terbuka untuk siapa saja. MuaraAI adalah ruang kerja untuk belajar, membuat project, dan menunjukkan Proof of Work lewat GitHub. Mahasiswa, pelajar, atau umum, dari mana saja, semua boleh bergabung.
        </p>
        <div className="mt-9 grid grid-cols-[1fr_auto] gap-3 sm:flex sm:gap-4">
          <Link href={signedIn ? "/dashboard" : "/api/auth/login"} className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-sm font-bold sm:px-5">
            {signedIn ? "Buka dashboard" : "Daftar dengan GitHub"}
            <Icon name="arrow_forward" className="h-4 w-4" />
          </Link>
          <Link href="/members" className="px-btn-ghost inline-flex min-h-11 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold sm:px-5">
            Lihat anggota
          </Link>
        </div>
        </div>
        <HeroShowcase stats={stats} />
      </div>
    </section>
  );
}
