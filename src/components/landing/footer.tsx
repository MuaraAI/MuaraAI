import Link from "next/link";
import Image from "next/image";
import React from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";

const products = [
  { label: "Muara Arus 1", href: "https://ai.muaraai.com/" },
  { label: "GitHub model", href: "https://github.com/MuaraAI/muara-arus-1" },
  { label: "Hugging Face", href: "https://huggingface.co/MuaraAI/muara-arus-1" },
  { label: "Ollama", href: "https://ollama.com/MuaraAI/muara-arus-1" },
  { label: "UBSI API", href: "https://ubsi-api.muaraai.com" },
];

const socials = [
  { label: "X", href: "https://x.com/MuaraAI" },
  { label: "Instagram", href: "https://www.instagram.com/muara.ai/" },
  { label: "Threads", href: "https://www.threads.com/@muara.ai" },
  { label: "GitHub", href: GITHUB_ORG_URL },
];

function ExternalLink({ label, href }: { label: string; href: string }) {
  return <Link href={href} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-muara-ocean">{label}</Link>;
}

export default function Footer() {
  return (
    <footer className="w-full border-t border-stroke bg-white px-4 py-14 text-secondary sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-[9px] border border-stroke bg-white shadow-xs"><Image src="/brand/muara-logo.png" alt="" width={36} height={36} className="h-8 w-8 object-contain" /></span>
            <span className="font-display text-base font-bold text-foreground">MuaraAI</span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-relaxed">Where local craft flows global. Komunitas mahasiswa lintas kampus Indonesia, lahir dari UBSI Pontianak.</p>
          <a
            href="mailto:admin@muaraai.com?subject=Tawaran%20Kemitraan%20MuaraAI"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-muara-ocean hover:underline transition-colors"
          >
            <Icon name="mail" className="w-4 h-4 text-muara-ocean" />
            <span>Hubungi kemitraan</span>
          </a>
        </div>
        <nav aria-label="Produk MuaraAI">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Produk</h2>
          <div className="mt-4 grid gap-3 text-sm">{products.map((item) => <ExternalLink key={item.href} {...item} />)}</div>
        </nav>
        <nav aria-label="Tautan MuaraAI">
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-foreground">Tautan</h2>
          <div className="mt-4 grid gap-3 text-sm">
            {socials.map((item) => <ExternalLink key={item.href} {...item} />)}
            <Link href="/terms" className="transition-colors hover:text-muara-ocean">Terms</Link>
            <Link href="/privacy" className="transition-colors hover:text-muara-ocean">Privacy</Link>
            <Link href="/code-of-conduct" className="transition-colors hover:text-muara-ocean">Code of Conduct</Link>
            <ExternalLink label="Email" href="mailto:admin@muaraai.com" />
          </div>
        </nav>
      </div>
      <div className="mx-auto mt-12 flex max-w-6xl items-center justify-between gap-4 border-t border-stroke pt-5 text-xs text-secondary">
        <span>Komunitas mahasiswa Indonesia · Lahir di Pontianak</span>
        <Icon name="north_east" className="h-4 w-4 text-muara-ocean" aria-hidden="true" />
      </div>
    </footer>
  );
}
