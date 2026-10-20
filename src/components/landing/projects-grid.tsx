import Link from "next/link";
import React from "react";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { communityContent } from "@/lib/community-content";
import SpotlightCard from "@/components/ui/spotlight-card";
import { Section, SectionHeader } from "@/components/ui/section";

export default function ProjectsGrid() {
  const projects = [
    {
      title: "Muara Arus 1",
      badge: "AI LOKAL",
      description: "AI akademik dan coding buatan MuaraAI untuk membantu mahasiswa FTI UBSI dari prodi SI, SIA, dan IF belajar dari materi yang tersedia.",
      tags: ["muara-arus-1", "1.5B parameter", "Offline", "SI · SIA · IF"],
      liveUrl: communityContent.muaraArusOne.playground,
      repoUrl: communityContent.muaraArusOne.github,
    },
    {
      title: "UBSI API",
      badge: "UNOFFICIAL PROJECT",
      description: "REST API tidak resmi yang menyatukan enam layanan digital UBSI. Mahasiswa login dengan akun mereka sendiri untuk mengakses layanan yang tersedia secara lebih terstruktur.",
      tags: ["StudentV2", "MyBest", "Elibrary", "EJournal", "Repository", "News"],
      liveUrl: communityContent.ubsiApi.liveUrl,
      repoUrl: communityContent.ubsiApi.repository,
    },
  ];

  return (
    <Section id="projects" tone="tint">
      <SectionHeader
        eyebrow="Karya & Artefak Nyata"
        title="Karya yang bisa dipakai."
        description="Project komunitas yang lahir dari kebutuhan belajar dan membangun solusi nyata."
      />

        <div className="rail rail-wide grid grid-cols-1 gap-8 md:grid-cols-2">
          {projects.map((p, idx) => (
            <FadeIn key={idx} direction={idx % 2 === 0 ? "left" : "right"} delay={idx * 0.1} className="h-full p-[2px]">
              <SpotlightCard
                className="px-card px-card-hover group flex h-full flex-col justify-between bg-white p-7 sm:p-8"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="px-chip inline-flex items-center gap-1.5 bg-teal-50 px-2.5 py-0.5 text-xs font-mono font-semibold text-teal-800">
                      <span className="h-1.5 w-1.5 bg-teal-600" />
                      {p.badge}
                    </span>
                  </div>

                  <h3 className="font-display text-2xl font-bold text-foreground group-hover:text-muara-ocean transition-colors mb-3">
                    {p.title}
                  </h3>

                  <p className="text-sm text-secondary leading-relaxed mb-6 font-sans">
                    {p.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="px-chip bg-surface-alt px-2.5 py-1 text-xs font-mono text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t-2 border-dashed border-[#CFE2EE] pt-4">
                  <Link
                    href={p.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-muara-ocean hover:text-muara-ocean-dark transition-colors font-mono"
                  >
                    <Icon name="open_in_new" className="w-4 h-4 text-muara-ocean" />
                    <span>Buka Web</span>
                  </Link>
                  <Link
                    href={p.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary hover:text-foreground transition-colors font-mono"
                  >
                    <Icon name="code" className="w-4 h-4" />
                    <span>Repositori GitHub</span>
                  </Link>
                </div>
              </SpotlightCard>
            </FadeIn>
          ))}
        </div>
    </Section>
  );
}
