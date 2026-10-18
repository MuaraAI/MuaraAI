import Link from "next/link";
import React from "react";
import { MuraAnimated } from "@/components/mascot/mura-animated";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <MuraAnimated
        pose="not-found"
        alt="Mura menunjuk arah setelah halaman tidak ditemukan"
        className="mb-6 w-40 sm:w-48"
        priority
        data-testid="mura-not-found"
      />
      <div className="text-center space-y-4 max-w-md">
        <span className="font-display font-bold text-6xl text-muara-ocean">404</span>
        <h1 className="font-display font-bold text-2xl text-foreground">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-muara-ocean hover:bg-muara-ocean-dark text-white px-5 py-2.5 text-sm font-bold transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
