import Link from "next/link";
import React from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";
import ContactTrigger from "./contact-trigger";

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-white text-slate-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-muara-sky border border-muara-ocean/30 text-muara-ocean font-display font-bold text-sm">
              M
            </span>
            <span className="font-display font-bold text-foreground text-base">Muara AI</span>
          </div>
          <p className="text-xs text-slate-500 max-w-sm text-center md:text-left">
            Where local craft flows global. Komunitas praktisi & riset AI rekayasa independen UBSI Pontianak.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 text-xs font-medium">
          <ContactTrigger label="Hubungi Kemitraan" />
          <Link href="/terms" className="hover:text-muara-ocean transition-colors">
            Terms of Service
          </Link>
          <Link href="/privacy" className="hover:text-muara-ocean transition-colors">
            Privacy Policy
          </Link>
          <Link href="/code-of-conduct" className="hover:text-muara-ocean transition-colors">
            Code of Conduct
          </Link>
          <Link
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muara-ocean transition-colors flex items-center gap-1.5"
          >
            <Icon name="code" className="w-4 h-4" />
            GitHub Org
          </Link>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <p>MIT License • Zero Slop • 100% Independent</p>
        </div>
      </div>
    </footer>
  );
}
