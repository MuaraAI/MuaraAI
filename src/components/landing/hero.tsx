"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const CODE_SNIPPETS = [
  `// 1. Multi-Tenant Vault Auth (AES-256-GCM)
const vault = await decryptCampusVault(req.headers['x-api-key']);
const session = await scraperPool.acquire(vault.nim);
return Response.json(await session.getGrades());`,

  `// 2. Autonomous Agent Execution Loop
const agent = new HermesAgent({ profile: "curzy-code" });
await agent.run({
  task: "Run regression test offline",
  tools: [read_file, patch, terminal]
});`,

  `// 3. Strict Anti-Slop Delivery Gate
assert(tests.passing === 126, "Offline suite 100% required");
assert(secrets.detected === 0, "Zero hardcoded credentials");
shipToProduction({ target: "muaraai.com" });`
];

export default function Hero() {
  const [snippetIndex, setSnippetIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSnippetIndex((prev) => (prev + 1) % CODE_SNIPPETS.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 border-b border-border">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-sky-200/40 blur-[130px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Hero Text */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-muara-ocean/20 bg-muara-sky/60 px-3.5 py-1 text-xs font-mono text-muara-ocean font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-muara-ocean animate-pulse" />
              AI ENGINEERING & CREATIVE SYNDICATE • PONTIANAK
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Where local craft <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-muara-ocean via-sky-600 to-teal-700">
                flows global.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Komunitas riset dan praktisi AI rekayasa independen mahasiswa UBSI Pontianak. 
              Bukan kelas teori atau ruang wacana santai — kami adalah studio produksi perangkat lunak, sistem agen otonom, dan media generatif kelas dunia berbasis <em>proof-of-work</em>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/#projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-6 py-3 text-sm font-bold transition-all shadow-ocean"
              >
                <Icon name="explore" className="w-4 h-4 text-white" />
                Jelajahi Proyek
              </Link>
              <Link
                href="/#syndicate"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-lg bg-surface hover:bg-surface-alt border border-border-ocean hover:border-slate-400 text-foreground px-6 py-3 text-sm font-semibold transition-colors shadow-sm"
              >
                <Icon name="group" className="w-4 h-4 text-muara-ocean" />
                Lihat Anggota
              </Link>
            </div>
          </div>

          {/* Right Terminal Loop Mockup */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="rounded-xl border border-border-ocean bg-white shadow-ocean-lg overflow-hidden font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border bg-slate-50 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-amber-400" />
                  <div className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-2 text-slate-500 text-[11px]">muara-agent-runtime</span>
                </div>
                <span className="text-[10px] text-muara-ocean font-bold">100% OFFLINE PASS</span>
              </div>
              <div className="p-5 overflow-x-auto min-h-[170px] flex items-center bg-slate-50/40">
                <pre className="text-slate-800 leading-relaxed transition-all duration-300">
                  <code>{CODE_SNIPPETS[snippetIndex]}</code>
                </pre>
              </div>
              <div className="border-t border-border bg-slate-50 px-4 py-2 flex items-center justify-between text-[11px] text-slate-500">
                <span>Cycle: {snippetIndex + 1} of {CODE_SNIPPETS.length}</span>
                <span className="flex items-center gap-1.5 text-teal-700 font-semibold">
                  <span className="h-1.5 w-1.5 rounded-full bg-teal-600" />
                  Kernel Ready
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
