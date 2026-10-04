"use client";

import React, { useEffect } from "react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground px-4">
      <div className="text-center space-y-4 max-w-md">
        <span className="font-display font-bold text-6xl text-rose-600">500</span>
        <h1 className="font-display font-bold text-2xl text-foreground">Terjadi Kesalahan Server</h1>
        <p className="text-sm text-slate-600">
          Sistem mengalami kendala tak terduga. Silakan coba muat ulang halaman.
        </p>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-5 py-2.5 text-xs font-bold transition-colors shadow-sm"
        >
          Muat Ulang
        </button>
      </div>
    </div>
  );
}
