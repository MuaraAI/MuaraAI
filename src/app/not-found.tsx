import Link from "next/link";
import React from "react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-4 max-w-md">
        <span className="font-display font-bold text-6xl text-muara-ocean">404</span>
        <h1 className="font-display font-bold text-2xl text-foreground">Halaman Tidak Ditemukan</h1>
        <p className="text-sm text-slate-600">
          Halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-5 py-2.5 text-xs font-bold transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
