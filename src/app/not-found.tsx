import Link from "next/link";
import React from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import StatusScene from "@/components/ui/status-scene";

const SUGGESTIONS = [
  { href: "/#projects", label: "Project komunitas" },
  { href: "/members", label: "Direktori anggota" },
  { href: "/onboarding", label: "Daftar anggota" },
  { href: "/code-of-conduct", label: "Code of Conduct" },
];

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex flex-1 items-center">
        <StatusScene
          code="404"
          eyebrow="Halaman tidak ditemukan"
          title="Arusnya berbelok ke tempat yang tidak ada."
          description="Halaman yang Anda tuju tidak tersedia, sudah dipindahkan, atau alamatnya salah ketik. Yuk kembali ke muara."
          mascotSrc="/mascot/mura/404-pointing.png"
          mascotAlt="Mura menunjuk arah setelah halaman tidak ditemukan"
          mascotTestId="mura-not-found"
          actions={
            <>
              <Link href="/" className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold">
                Kembali ke Beranda
              </Link>
              <Link href="/members" className="px-btn-ghost inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold">
                Lihat anggota
              </Link>
            </>
          }
          footer={
            <nav aria-label="Saran halaman">
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">Mungkin Anda mencari</p>
              <ul className="flex flex-wrap gap-3">
                {SUGGESTIONS.map((s) => (
                  <li key={s.href}>
                    <Link href={s.href} className="px-chip inline-flex items-center gap-1.5 bg-white px-2.5 py-1 font-mono text-xs text-secondary transition-colors hover:bg-[#E1EEF7] hover:text-foreground [--px-line:#CFE2EE]">
                      <span className="h-1.5 w-1.5 bg-muara-ocean" aria-hidden="true" />
                      {s.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          }
        />
      </main>
      <Footer />
    </div>
  );
}
