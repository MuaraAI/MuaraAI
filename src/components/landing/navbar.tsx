"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";

type Locale = "id" | "en";

interface NavbarProps {
  locale?: Locale;
  user?: {
    id: string;
    fullName?: string;
    roleTitle?: string;
  } | null;
}

const COPY = {
  id: {
    home: "/",
    join: "/onboarding",
    links: [
      { href: "/projects", label: "Project" },
      { href: "/karya", label: "Karya" },
      { href: "/#struktur", label: "Struktur" },
      { href: "/members", label: "Anggota" },
      { href: "/code-of-conduct", label: "Aturan" },
    ],
    logIn: "Masuk",
    signUp: "Daftar",
    main: "Menu utama",
    mobile: "Menu mobile",
    open: "Buka menu",
    close: "Tutup menu",
  },
  en: {
    home: "/en",
    join: "/en/join",
    links: [
      { href: "/projects", label: "Projects" },
      { href: "/en/karya", label: "Works" },
      { href: "/en#struktur", label: "Structure" },
      { href: "/members", label: "Members" },
      { href: "/en/code-of-conduct", label: "Rules" },
    ],
    logIn: "Log in",
    signUp: "Join",
    main: "Main menu",
    mobile: "Mobile menu",
    open: "Open menu",
    close: "Close menu",
  },
} as const;

const linkClass = (active: boolean) =>
  `px-3 py-2 text-sm font-medium transition-colors ${active ? "text-foreground" : "text-secondary hover:text-foreground"}`;

export default function Navbar({ user, locale = "id" }: NavbarProps) {
  const copy = COPY[locale];
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      // The focused link disappears with the panel, so hand focus back to the button.
      buttonRef.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname?.startsWith(`${href}/`) === true;

  return (
    <header className="sticky top-0 z-50 border-b border-stroke bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-[100rem] items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        <Link href={copy.home} className="flex items-center gap-2.5">
          <span className="px-frame flex h-8 w-8 items-center justify-center overflow-hidden bg-white [--px-line:#CFE2EE]">
            <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" priority />
          </span>
          <span className="font-display text-base font-bold tracking-tight text-foreground">Muara AI</span>
        </Link>

        <nav aria-label={copy.main} className="hidden items-center gap-1 md:flex">
          {copy.links.map((link) => (
            <Link key={link.href} href={link.href} aria-current={isActive(link.href) ? "page" : undefined} className={linkClass(isActive(link.href))}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href={GITHUB_ORG_URL} target="_blank" rel="noopener noreferrer" aria-label="GitHub Organization" className="p-2 text-secondary transition-colors hover:text-foreground">
            <Icon name="github" className="h-4 w-4" />
          </Link>
          {user ? (
            <Link href="/dashboard" className="px-btn px-4 py-1.5 text-xs font-bold [--px-off:3px]">Dashboard</Link>
          ) : (
            <>
              <Link href="/login" className="px-3 py-2 text-sm font-medium text-secondary transition-colors hover:text-foreground">{copy.logIn}</Link>
              <Link href={copy.join} className="px-btn px-4 py-1.5 text-xs font-bold [--px-off:3px]">{copy.signUp}</Link>
            </>
          )}
        </div>

        <button
          ref={buttonRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? copy.close : copy.open}
          aria-expanded={open}
          aria-controls={open ? "mobile-menu" : undefined}
          className="flex h-11 w-11 items-center justify-center text-foreground md:hidden"
        >
          <Icon name={open ? "close" : "menu"} className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" aria-label={copy.mobile} className="border-t border-stroke bg-white px-4 pb-5 pt-3 md:hidden">
          <ul className="flex flex-col">
            {copy.links.map((link) => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setOpen(false)} aria-current={isActive(link.href) ? "page" : undefined} className="flex min-h-11 items-center text-base font-medium text-foreground">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex gap-2">
            {user ? (
              <Link href="/dashboard" className="px-btn flex min-h-11 flex-1 items-center justify-center text-sm font-bold">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="px-btn-ghost flex min-h-11 flex-1 items-center justify-center text-sm font-semibold">{copy.logIn}</Link>
                <Link href={copy.join} className="px-btn flex min-h-11 flex-1 items-center justify-center text-sm font-bold">{copy.signUp}</Link>
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
