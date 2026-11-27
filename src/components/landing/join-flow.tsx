import React from "react";
import Link from "next/link";
import Icon, { IconName } from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import DrawLine from "@/components/ui/draw-line";
import { Section, SectionHeader } from "@/components/ui/section";

export default function JoinFlow({ signedIn = false }: { signedIn?: boolean }) {
  const steps: { num: string; title: string; desc: string; icon: IconName }[] = [
    {
      num: "01",
      title: "Login with GitHub",
      desc: "Masuk dengan akun GitHub kamu. Tanpa password, tanpa magic link.",
      icon: "login",
    },
    {
      num: "02",
      title: "Kirim Proof of Work",
      desc: "Sertakan tautan repositori atau karya, pilih posisimu, dan ceritakan kenapa kamu mau bergabung.",
      icon: "upload_file",
    },
    {
      num: "03",
      title: "Undangan Otomatis Organisasi",
      desc: "Saat disetujui maintainer, akun kamu otomatis diundang ke GitHub Org github.com/MuaraAI.",
      icon: "mark_email_read",
    },
  ];

  return (
    <Section tone="tint">
      <SectionHeader
        eyebrow="Alur Pendaftaran"
        title="3 Langkah Bergabung"
        description="Terbuka untuk siapa saja. Kami menilai karya dan alasanmu bergabung, bukan latar belakangmu."
      />

        {/* Dashed pixel track that draws itself behind the steps on desktop */}
        <div className="relative">
          <DrawLine />
        <div className="rail relative grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((s, idx) => (
            <FadeIn key={idx} delay={0.15 + idx * 0.2} className="h-full p-[2px]">
              <div
                className="px-card px-card-hover group relative flex h-full flex-col justify-between bg-white p-7 sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono text-3xl font-bold text-[#B9D3E4] transition-colors duration-300 group-hover:text-muara-ocean">
                      {s.num}
                    </span>
                    <span className="px-icon h-10 w-10">
                      <Icon name={s.icon} className="w-5 h-5 text-muara-ocean" />
                    </span>
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-secondary">
                    {s.desc}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
        </div>

        <FadeIn className="mt-12 text-center" delay={0.2}>
          <Link
            href={signedIn ? "/dashboard" : "/api/auth/login"}
            className="px-btn inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold"
          >
            <Icon name="arrow_forward" className="w-4 h-4 text-white" />
            {signedIn ? "Buka dashboard" : "Mulai Kirim Proof of Work Sekarang"}
          </Link>
        </FadeIn>
    </Section>
  );
}
