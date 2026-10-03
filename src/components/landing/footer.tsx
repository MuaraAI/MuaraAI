import Link from "next/link";
import React from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-surface/50 text-slate-400 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-surface border border-muara-cyan/30 text-muara-cyan font-display font-bold text-sm">
              M
            </span>
            <span className="font-display font-bold text-white text-base">Muara AI</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
            Where local craft flows global. Komunitas praktisi & riset AI rekayasa independen UBSI Pontianak.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
          <Link href="/terms" className="hover:text-white transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-white transition-colors">
            Privacy Policy
          </Link>
          <Link href="/code-of-conduct" className="hover:text-white transition-colors">
            Code of Conduct
          </Link>
          <Link
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors flex items-center gap-1"
          >
            <span className="material-symbols-rounded text-sm">code</span>
            GitHub Org
          </Link>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <p>MIT License • Zero Slop • 100% Independent</p>
          <p className="mt-1 font-mono text-[10px]">Tencent VPS • Cloudflare • Supabase</p>
        </div>
      </div>
    </footer>
  );
}
