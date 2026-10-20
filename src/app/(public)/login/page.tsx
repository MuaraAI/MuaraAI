import React from "react";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import TypeText from "@/components/ui/type-text";
import { isDevMockEnabled } from "@/lib/dev-mock";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const metadata = { title: "Masuk — MuaraAI" };

const ERRORS: Record<string, string> = {
  oauth_failed: "Login GitHub gagal. Coba lagi beberapa saat lagi.",
  not_configured: "Login GitHub belum aktif di lingkungan ini (Supabase belum dikonfigurasi).",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const devMock = isDevMockEnabled();
  const oauthReady = isSupabaseConfigured() && !devMock;

  return (
    <div className="mx-auto grid min-h-[calc(100dvh-72px-320px)] max-w-[100rem] items-center gap-10 px-4 py-12 sm:px-6 md:py-20 lg:grid-cols-[1fr_0.9fr] lg:px-8">
      <div className="max-w-xl">
        <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muara-ocean">
          <span className="h-1.5 w-1.5 bg-muara-ocean" aria-hidden="true" />
          <TypeText text="Portal Anggota" speed={30} />
        </p>
        <FadeIn distance={18}>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Masuk ke MuaraAI</h1>
        </FadeIn>
        <FadeIn delay={0.1} distance={14}>
          <p className="mt-4 text-[15px] leading-relaxed text-secondary">
            Gunakan akun GitHub yang terdaftar. Belum jadi anggota? Isi{" "}
            <Link href="/onboarding" className="font-semibold text-muara-ocean underline-offset-4 hover:underline">form onboarding</Link>{" "}
            dulu, lalu kirim Proof of Work.
          </p>
        </FadeIn>

        {error && ERRORS[error] && (
          <FadeIn delay={0.15} distance={10}>
            <p role="alert" className="px-chip mt-6 flex items-start gap-2 bg-rose-50 px-3 py-2 text-sm text-rose-800 [--px-line:rgba(225,29,72,.4)]">
              <Icon name="error" className="mt-0.5 h-4 w-4 shrink-0" />
              {ERRORS[error]}
            </p>
          </FadeIn>
        )}

        <FadeIn delay={0.2} distance={14}>
          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            {oauthReady ? (
              <Link href="/api/auth/login" className="px-btn inline-flex min-h-12 items-center justify-center gap-2.5 px-6 py-3 text-sm font-bold">
                <Icon name="github" className="h-5 w-5" />
                Lanjutkan dengan GitHub
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="px-frame inline-flex min-h-12 cursor-not-allowed items-center justify-center gap-2.5 bg-surface-alt px-6 py-3 text-sm font-bold text-secondary [--px-line:#CFE2EE]"
              >
                <Icon name="github" className="h-5 w-5" />
                Login GitHub belum aktif
              </span>
            )}
            <Link href="/onboarding" className="px-btn-ghost inline-flex min-h-12 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
              Daftar anggota baru
            </Link>
          </div>
        </FadeIn>

        {devMock && (
          <FadeIn delay={0.3} distance={14}>
            <section aria-label="Login dummy lokal" className="px-frame mt-10 bg-[#FFFBEB] p-5 [--px-line:#D97706]">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-amber-800">
                <span className="h-1.5 w-1.5 bg-amber-600" aria-hidden="true" />
                Mode lokal · data dummy
              </p>
              <p className="mt-2 text-sm leading-relaxed text-amber-900/80">
                Hanya aktif di <code className="font-mono text-xs">npm run dev</code> dengan <code className="font-mono text-xs">MUARA_DEV_MOCK=1</code>. Data contoh tidak ikut ter-push dan tidak pernah tampil di produksi.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link href="/api/dev/login?as=member" className="px-btn-ghost flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold">
                  <Icon name="group" className="h-4 w-4" />
                  Masuk sebagai Anggota
                </Link>
                <Link href="/api/dev/login?as=admin" className="px-btn flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold">
                  <Icon name="shield" className="h-4 w-4" />
                  Masuk sebagai Admin
                </Link>
              </div>
            </section>
          </FadeIn>
        )}
      </div>

      <FadeIn direction="right" delay={0.15} distance={36} className="hidden lg:block">
        <div className="px-card relative overflow-hidden bg-white p-8 [--px-drop:#CFE2EE]">
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-secondary">Setelah masuk</p>
          <ul className="mt-5 space-y-4">
            {[
              ["dashboard", "Dashboard anggota", "Status keanggotaan, iuran, dan langkah berikutnya."],
              ["school", "Muara Learn", "Materi belajar yang dikurasi maintainer."],
              ["account_balance_wallet", "Kas komunitas", "Riwayat iuran dan transparansi pengeluaran."],
            ].map(([icon, title, desc]) => (
              <li key={title} className="flex gap-4">
                <span className="px-icon h-10 w-10 shrink-0">
                  <Icon name={icon} className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display font-bold text-foreground">{title}</p>
                  <p className="text-sm text-secondary">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </FadeIn>
    </div>
  );
}
