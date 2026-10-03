import Link from "next/link";
import React from "react";

export default function ProjectsGrid() {
  const projects = [
    {
      title: "UBSI API",
      version: "v1.1.5",
      badge: "LIVE & PRODUCTION",
      description:
        "REST API Aggregator tidak resmi untuk 6 layanan digital kampus UBSI (SIAKAD StudentV2, MyBest LMS, Elibrary OPAC, EJournal OJS, Repository EPrints, dan Portal Berita). Dilengkapi 2-tier cache Redis dan vault kredensial multi-tenant.",
      tags: ["Python 3.12+", "FastAPI", "Redis Cache", "Scrapling", "126 Tests"],
      liveUrl: "https://ubsi-api.muaraai.com",
      repoUrl: "https://github.com/MuaraAI/UBSI-API",
      statusColor: "emerald",
    },
    {
      title: "Muara AI Gateway",
      version: "v1.0 Flash",
      badge: "ACTIVE PORTAL",
      description:
        "Portal anggota dan self-service dashboard API key untuk gateway model AI Muara V1 Flash. Terintegrasi penuh dengan SSO 'Login with MuaraAI' dan per-role dynamic rate limits.",
      tags: ["Next.js 15", "Cloudflare Worker", "Supabase SSR", "SSO Auth", "WebCrypto"],
      liveUrl: "https://ai.muaraai.com",
      repoUrl: "https://github.com/MuaraAI/ai-web",
      statusColor: "cyan",
    },
  ];

  return (
    <section id="projects" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border/50">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-cyan mb-2">
              Karya & Artefak Nyata
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              The Hall of Projects
            </p>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Setiap proyek dibangun dengan standar rekayasa ketat, zero secret leaks, dan pengujian otomatis 100% offline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map((p, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border bg-surface hover:border-muara-cyan/50 transition-all p-8 flex flex-col justify-between group shadow-lg"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-xs font-mono font-semibold text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    {p.badge}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{p.version}</span>
                </div>

                <h3 className="font-display text-2xl font-bold text-white group-hover:text-muara-cyan transition-colors mb-3">
                  {p.title}
                </h3>

                <p className="text-sm text-slate-300 leading-relaxed mb-6">
                  {p.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-8">
                  {p.tags.map((tag, tIdx) => (
                    <span
                      key={tIdx}
                      className="rounded bg-background/80 border border-border/80 px-2.5 py-1 text-xs font-mono text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-4 pt-4 border-t border-border/60">
                <Link
                  href={p.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-white hover:text-muara-cyan transition-colors"
                >
                  <span className="material-symbols-rounded text-base text-muara-cyan">open_in_new</span>
                  Buka Web
                </Link>
                <Link
                  href={p.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  <span className="material-symbols-rounded text-base">code</span>
                  Repositori GitHub
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
