import Link from "next/link";
import React from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import StatusScene from "@/components/ui/status-scene";
import type { Locale } from "@/lib/locale";

const COPY = {
  id: {
    home: "/",
    members: "/members",
    eyebrow: "Halaman tidak ditemukan",
    title: "Arusnya berbelok ke tempat yang tidak ada.",
    description: "Halaman yang Anda tuju tidak tersedia, sudah dipindahkan, atau alamatnya salah ketik. Yuk kembali ke muara.",
    mascotAlt: "Mura menunjuk arah setelah halaman tidak ditemukan",
    backHome: "Kembali ke Beranda",
    seeMembers: "Lihat anggota",
    suggestionsLabel: "Saran halaman",
    looking: "Mungkin Anda mencari",
    suggestions: [
      { href: "/projects", label: "Project komunitas" },
      { href: "/members", label: "Direktori anggota" },
      { href: "/onboarding", label: "Daftar anggota" },
      { href: "/code-of-conduct", label: "Code of Conduct" },
    ],
  },
  en: {
    home: "/en",
    members: "/members",
    eyebrow: "Page not found",
    title: "The current took a turn somewhere that does not exist.",
    description: "The page you were looking for is not available, has moved, or the address has a typo. Let's head back to the river mouth.",
    mascotAlt: "Mura pointing the way after a page was not found",
    backHome: "Back to Home",
    seeMembers: "See members",
    suggestionsLabel: "Suggested pages",
    looking: "You might be looking for",
    suggestions: [
      { href: "/projects", label: "Community projects" },
      { href: "/members", label: "Member directory" },
      { href: "/en/join", label: "Join the community" },
      { href: "/en/code-of-conduct", label: "Code of Conduct" },
    ],
  },
} as const;

export default function NotFoundView({ locale, user = null }: { locale: Locale; user?: { id: string } | null }) {
  const t = COPY[locale];
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Navbar locale={locale} user={user} />
      <main className="flex flex-1 items-center">
        <StatusScene
          code="404"
          eyebrow={t.eyebrow}
          title={t.title}
          description={t.description}
          mascotSrc="/mascot/mura/404-pointing.png"
          mascotAlt={t.mascotAlt}
          mascotTestId="mura-not-found"
          actions={
            <>
              <Link href={t.home} className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold">
                {t.backHome}
              </Link>
              <Link href={t.members} className="px-btn-ghost inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold">
                {t.seeMembers}
              </Link>
            </>
          }
          footer={
            <nav aria-label={t.suggestionsLabel}>
              <p className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">{t.looking}</p>
              <ul className="flex flex-wrap gap-3">
                {t.suggestions.map((s) => (
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
      <Footer locale={locale} />
    </div>
  );
}
