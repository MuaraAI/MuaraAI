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

const legal = [
  { label: "Terms", href: "/terms" },
  { label: "Privacy", href: "/privacy" },
  { label: "Code of Conduct", href: "/code-of-conduct" },
];

const LINK_CLASS =
  "group inline-flex items-center gap-1.5 py-0.5 text-[13px] text-secondary transition-colors duration-200 hover:text-muara-ocean";

function Marker() {
  return (
    <span
      className="h-1.5 w-0 bg-muara-ocean transition-all duration-200 ease-out group-hover:w-1.5"
      aria-hidden="true"
    />
  );
}

function FooterLink({ label, href }: { label: string; href: string }) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  return (
    <Link
      href={href}
      className={LINK_CLASS}
      {...(external && !href.startsWith("mailto:") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      <Marker />
      {label}
    </Link>
  );
}

function Column({ title, label, items }: { title: string; label: string; items: { label: string; href: string }[] }) {
  return (
    <nav aria-label={label}>
      <h2 className="flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-foreground">
        <span className="h-1.5 w-1.5 bg-muara-ocean" aria-hidden="true" />
        {title}
      </h2>
      <div className="mt-3 flex flex-col items-start gap-1.5">
        {items.map((item) => (
          <FooterLink key={item.href} {...item} />
        ))}
      </div>
    </nav>
  );
}

/** Thin stepped-wave strip that tops the footer. */
function PixelShore() {
  return (
    <svg className="block h-3 w-full" preserveAspectRatio="none" shapeRendering="crispEdges" aria-hidden="true">
      <defs>
        <pattern id="footer-shore" width="16" height="12" patternUnits="userSpaceOnUse">
          <rect width="16" height="12" fill="#EEF6FB" />
          <rect y="4" width="4" height="8" fill="#9CC6E0" />
          <rect x="4" y="2" width="4" height="10" fill="#9CC6E0" />
          <rect x="8" y="4" width="4" height="8" fill="#9CC6E0" />
          <rect x="12" y="6" width="4" height="6" fill="#9CC6E0" />
          <rect y="8" width="16" height="4" fill="#5FA3CC" />
          <rect y="10" width="16" height="2" fill="#0369A1" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#footer-shore)" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="w-full bg-white text-secondary">
      <PixelShore />
      <div className="px-4 pb-6 pt-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[100rem] grid-cols-3 gap-x-4 gap-y-8 sm:gap-x-8 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-x-20 xl:gap-x-28">
          <div className="col-span-3 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="px-frame flex h-8 w-8 items-center justify-center overflow-hidden bg-white [--px-line:#CFE2EE]">
                <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" />
              </span>
              <span className="font-display text-base font-bold text-foreground">MuaraAI</span>
            </div>
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed">
              Where local craft flows global. Komunitas mahasiswa lintas kampus Indonesia, lahir dari UBSI Pontianak.
            </p>
            <div className="mt-4">
              <a
                href="mailto:admin@muaraai.com?subject=Tawaran%20Kemitraan%20MuaraAI"
                className="px-btn-ghost inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-semibold [--px-off:3px]"
              >
                <Icon name="mail" className="h-4 w-4 text-muara-ocean" />
                <span>Hubungi kemitraan</span>
              </a>
            </div>
          </div>
          <Column title="Produk" label="Produk MuaraAI" items={products} />
          <Column title="Komunitas" label="Komunitas MuaraAI" items={socials} />
          <Column title="Legal" label="Tautan MuaraAI" items={[...legal, { label: "Email", href: "mailto:admin@muaraai.com" }]} />
        </div>

        <div className="mx-auto mt-8 flex max-w-[100rem] flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[#CFE2EE] pt-4 font-mono text-[11px]">
          <span>© 2026 MuaraAI · Komunitas mahasiswa Indonesia · Lahir di Pontianak</span>
          <a href="#" className="group inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors duration-200 hover:text-muara-ocean">
            <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5" aria-hidden="true">▲</span>
            Ke atas
          </a>
        </div>
      </div>
    </footer>
  );
}
