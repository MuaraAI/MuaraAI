import Link from "next/link";
import Image from "next/image";
import React from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import { communityContent } from "@/lib/community-content";
import Icon from "@/components/ui/icon";

type Locale = "id" | "en";

const COPY = {
  id: {
    tagline: "Where local craft flows global. Komunitas terbuka untuk siapa saja, lahir di Pontianak.",
    partnership: "Hubungi kemitraan",
    partnershipSubject: "Tawaran Kemitraan MuaraAI",
    products: "Produk",
    productsLabel: "Produk MuaraAI",
    community: "Komunitas",
    communityLabel: "Komunitas MuaraAI",
    legalLabel: "Tautan MuaraAI",
    copyright: "© 2026 MuaraAI · Komunitas terbuka · Lahir di Pontianak",
    top: "Ke atas",
    language: "Bahasa",
  },
  en: {
    tagline: "Where local craft flows global. An open community for anyone, born in Pontianak.",
    partnership: "Partnership enquiries",
    partnershipSubject: "Partnership enquiry MuaraAI",
    products: "Products",
    productsLabel: "MuaraAI products",
    community: "Community",
    communityLabel: "MuaraAI community",
    legalLabel: "MuaraAI links",
    copyright: "© 2026 MuaraAI · Open community · Born in Pontianak",
    top: "Back to top",
    language: "Language",
  },
} as const;

const products = communityContent.products.map((product) => ({ label: product.name, href: product.url }));

const socials = [
  { label: "X", href: "https://x.com/MuaraAI" },
  { label: "Instagram", href: "https://www.instagram.com/muara.ai/" },
  { label: "Threads", href: "https://www.threads.com/@muara.ai" },
  { label: "GitHub", href: GITHUB_ORG_URL },
];

const legal = {
  id: [
    { label: "Terms", href: "/terms" },
    { label: "Privacy", href: "/privacy" },
    { label: "Code of Conduct", href: "/code-of-conduct" },
  ],
  en: [
    { label: "Terms", href: "/en/terms" },
    { label: "Privacy", href: "/en/privacy" },
    { label: "Code of Conduct", href: "/en/code-of-conduct" },
  ],
} as const;

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

export default function Footer({ locale = "id" }: { locale?: Locale }) {
  const copy = COPY[locale];
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
              {copy.tagline}
            </p>
            <div className="mt-4">
              <a
                href={`mailto:admin@muaraai.com?subject=${encodeURIComponent(copy.partnershipSubject)}`}
                className="px-btn-ghost inline-flex items-center gap-2 px-3 py-1.5 font-mono text-xs font-semibold [--px-off:3px]"
              >
                <Icon name="mail" className="h-4 w-4 text-muara-ocean" />
                <span>{copy.partnership}</span>
              </a>
            </div>
          </div>
          <Column title={copy.products} label={copy.productsLabel} items={products} />
          <Column title={copy.community} label={copy.communityLabel} items={socials} />
          <Column title="Legal" label={copy.legalLabel} items={[...legal[locale], { label: "Email", href: "mailto:admin@muaraai.com" }]} />
        </div>

        <div className="mx-auto mt-8 flex max-w-[100rem] flex-wrap items-center justify-between gap-3 border-t-2 border-dashed border-[#CFE2EE] pt-4 font-mono text-[11px]">
          <span>{copy.copyright}</span>
          <nav aria-label={copy.language} className="flex items-center gap-3">
            {([["id", "Bahasa Indonesia", "/"], ["en", "English", "/en"]] as const).map(([code, label, href]) => (
              <Link key={code} href={href} aria-current={code === locale ? "true" : undefined} className={code === locale ? "font-semibold text-foreground" : "text-secondary hover:text-muara-ocean"}>
                {label}
              </Link>
            ))}
          </nav>
          <a href="#" className="group inline-flex items-center gap-1.5 font-semibold text-foreground transition-colors duration-200 hover:text-muara-ocean">
            <span className="inline-block transition-transform duration-200 ease-out group-hover:-translate-y-0.5" aria-hidden="true">▲</span>
            {copy.top}
          </a>
        </div>
      </div>
    </footer>
  );
}
