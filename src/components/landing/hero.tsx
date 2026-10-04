"use client";

import Link from "next/link";
import React, { useState } from "react";
import Icon from "@/components/ui/icon";

type TabType = "curl" | "typescript" | "response";

const CODE_CONTENTS: Record<TabType, string> = {
  curl: `curl -X GET \\
  "https://api.muaraai.com/v1/ubsi-api/v1/elearning/courses" \\
  -H "X-API-Key: muara_ubsi_7f8a9b2c..." \\
  -H "Accept: application/json"`,

  typescript: `import { MuaraClient } from '@muara/sdk';

const client = new MuaraClient({
  apiKey: process.env.MUARA_API_KEY
});

// Otomasi multi-tenant scraper kampus
const res = await client.courses.list();
console.log(res.data.courses);`,

  response: `{
  "status": "success",
  "data": {
    "student_nim": "15260767",
    "campus": "UBSI Pontianak",
    "kelas": "15.1C.30",
    "active_courses": 6,
    "vault_status": "aes_256_gcm_verified"
  },
  "latency_ms": 14.2
}`,
};

export default function Hero() {
  const [activeTab, setActiveTab] = useState<TabType>("curl");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(CODE_CONTENTS[activeTab]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-stroke bg-background">
      {/* Ambient hydro diffusion gradient */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-br from-sky-200/40 via-cyan-100/25 to-transparent blur-[140px] rounded-full pointer-events-none -z-10" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left Hero Content */}
          <div className="flex-1 text-center lg:text-left space-y-6">
            {/* Design Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-alt border border-stroke px-3.5 py-1 text-xs font-mono font-medium text-muara-ocean shadow-xs">
              <Icon name="waves" className="w-3.5 h-3.5 text-muara-ocean" />
              <span>Fluid Currents Light v2 — UBSI Syndicate</span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Where local craft <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-muara-ocean via-sky-600 to-teal-700">
                flows global.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-secondary max-w-2xl leading-relaxed font-sans">
              Komunitas riset dan praktisi AI rekayasa independen eksklusif mahasiswa UBSI. 
              Bukan kelas teori santai — kami adalah studio produksi perangkat lunak, sistem agen otonom, dan media generatif kelas dunia berbasis <em>proof-of-work</em> nyata.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Link
                href="/#projects"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-foreground hover:bg-secondary text-white px-6 py-3 text-sm font-bold transition-all shadow-diffusion"
              >
                <span>Jelajahi Proyek</span>
                <Icon name="arrow_forward" className="w-4 h-4 text-white" />
              </Link>
              <Link
                href="/members"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-[10px] bg-white hover:bg-surface-alt border border-stroke text-foreground px-6 py-3 text-sm font-semibold transition-colors shadow-xs"
              >
                <Icon name="group" className="w-4 h-4 text-muara-ocean" />
                <span>Direktori Anggota</span>
              </Link>
            </div>

            {/* Quality Status Chips */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-4 text-xs font-mono">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-stroke px-3 py-1 text-emerald-800 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>API 99.9% Uptime</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-stroke px-3 py-1 text-amber-900 font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                <span>15.5:1 Text Contrast</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-stroke px-3 py-1 text-secondary font-medium">
                <Icon name="verified" className="w-3.5 h-3.5 text-muara-ocean" />
                <span>Zero Font CDN</span>
              </span>
            </div>
          </div>

          {/* Right Interactive Terminal Card */}
          <div className="flex-1 w-full max-w-lg lg:max-w-none">
            <div className="rounded-[18px] border border-stroke bg-white shadow-lift overflow-hidden font-mono text-xs transition-all">
              {/* Header with Interactive Tabs */}
              <div className="flex items-center justify-between border-b border-stroke bg-surface-alt px-4 py-2.5">
                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("curl")}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                      activeTab === "curl"
                        ? "bg-white text-foreground shadow-xs font-bold border border-stroke"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    curl
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("typescript")}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                      activeTab === "typescript"
                        ? "bg-white text-foreground shadow-xs font-bold border border-stroke"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    TypeScript
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("response")}
                    className={`px-3 py-1 rounded-md text-xs font-mono font-medium transition-colors ${
                      activeTab === "response"
                        ? "bg-white text-foreground shadow-xs font-bold border border-stroke"
                        : "text-secondary hover:text-foreground"
                    }`}
                  >
                    JSON Response
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-stroke bg-white hover:bg-slate-50 text-slate-600 text-[11px] font-mono transition-colors shadow-xs"
                >
                  <Icon name={copied ? "check" : "content_copy"} className="w-3.5 h-3.5 text-muara-ocean" />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Code Snippet Body */}
              <div className="p-5 overflow-x-auto min-h-[200px] flex items-center bg-white">
                <pre className="text-foreground leading-relaxed transition-all duration-200 w-full font-mono text-xs">
                  <code>{CODE_CONTENTS[activeTab]}</code>
                </pre>
              </div>

              {/* Terminal Footer */}
              <div className="border-t border-stroke bg-surface-alt px-4 py-2 flex items-center justify-between text-[11px] text-secondary">
                <div className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>AES-256-GCM Vault Active</span>
                </div>
                <span className="font-semibold text-muara-ocean">Latency: ~14ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
