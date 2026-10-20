"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import StatusScene from "@/components/ui/status-scene";

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
    <div className="flex min-h-screen items-center bg-background text-foreground">
      <StatusScene
        code="500"
        tone="rose"
        eyebrow="Terjadi kesalahan server"
        title="Ada yang tersangkut di hulu."
        description="Sistem mengalami kendala tak terduga. Coba muat ulang halaman; kalau masih terjadi, kabari maintainer lewat admin@muaraai.com."
        mascotSrc="/mascot/mura/500-maintenance.png"
        mascotAlt="Mura memegang kunci, siap memperbaiki sistem"
        actions={
          <>
            <button type="button" onClick={() => reset()} className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold">
              Muat Ulang
            </button>
            <Link href="/" className="px-btn-ghost inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold">
              Kembali ke Beranda
            </Link>
          </>
        }
      />
    </div>
  );
}
