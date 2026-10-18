import Link from "next/link";
import React from "react";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { communityContent } from "@/lib/community-content";
import SpotlightCard from "@/components/ui/spotlight-card";

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
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-stroke bg-surface-alt/40">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
              Karya & Artefak Nyata
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Karya yang bisa dipakai.
            </p>
          </div>
          <p className="text-sm text-secondary max-w-md font-sans">
            Project komunitas yang lahir dari kebutuhan belajar dan membangun solusi nyata.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, idx) => (
            <FadeIn key={idx} delay={idx * 0.15}>
              <SpotlightCard
                className="rounded-[18px] border border-stroke bg-white hover:border-muara-ocean transition-all p-8 flex flex-col justify-between group shadow-diffusion hover:shadow-lift h-full"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-xs font-mono font-semibold text-teal-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
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
                        className="rounded-[6px] bg-surface-alt border border-stroke px-2.5 py-1 text-xs font-mono text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-4 border-t border-stroke">
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
      </div>
    </section>
  );
}
