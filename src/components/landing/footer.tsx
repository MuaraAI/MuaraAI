import Link from "next/link";
import Image from "next/image";
import React from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";
import ContactTrigger from "./contact-trigger";

export default function Footer() {
  return (
    <footer className="w-full border-t border-stroke bg-white text-secondary py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-white border border-stroke overflow-hidden shadow-xs">
              <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" />
            </span>
            <span className="font-display font-bold text-foreground text-base">Muara AI</span>
          </div>
          <p className="text-xs text-secondary max-w-sm text-center md:text-left font-sans">
            Where local craft flows global. Komunitas praktisi & riset AI rekayasa independen eksklusif mahasiswa UBSI.
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
          <Link href="https://x.com/MuaraAI" target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean transition-colors">X</Link>
          <Link href="https://www.instagram.com/muara.ai/" target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean transition-colors">Instagram</Link>
          <Link href="https://www.threads.com/@muara.ai" target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean transition-colors">Threads</Link>
          <Link href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" className="hover:text-muara-ocean transition-colors flex items-center gap-1.5">
            <Icon name="code" className="w-4 h-4" /> GitHub Org
          </Link>
          <Link href="mailto:admin@muaraai.com" className="hover:text-muara-ocean transition-colors">Email</Link>
        </div>

        <div className="text-xs text-slate-500 text-center md:text-right">
          <p>Komunitas mahasiswa UBSI · Lahir di Pontianak</p>
        </div>
      </div>
    </footer>
  );
}
