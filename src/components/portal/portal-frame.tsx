"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import Icon from "@/components/ui/icon";

export type PortalUser = { full_name?: string | null; github_username?: string | null };

/**
 * Shared portal layout: sticky full-height sidebar (only the content column scrolls), a sticky topbar
 * with breadcrumb + account actions, and a slide-in drawer for the sidebar on phones.
 */
export default function PortalFrame({
  variant,
  sidebar,
  user,
  currentLabel,
  order = [],
  children,
}: {
  variant: "member" | "admin";
  /** Sidebar hrefs in display order; page changes slide in from the side of the destination. */
  order?: string[];
  sidebar: React.ReactNode;
  user?: PortalUser | null;
  currentLabel?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dark = variant === "admin";

  // Close the phone drawer after navigating and lock page scroll while it is open.
  useEffect(() => setDrawerOpen(false), [pathname]);
  useEffect(() => {
    if (!drawerOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [drawerOpen]);

  const workspace = dark ? "Maintainer" : "Anggota";

  // Which sidebar item owns this route (longest matching href), and which way we moved.
  const routeIndex = order.reduce((best, href, i) => (pathname?.startsWith(href) && href.length > (order[best]?.length ?? -1) ? i : best), -1);
  const lastIndex = useRef(routeIndex);
  const direction = useRef(0);
  const lastPath = useRef(pathname);
  if (lastPath.current !== pathname) {
    direction.current = routeIndex >= 0 && lastIndex.current >= 0 ? Math.sign(routeIndex - lastIndex.current) : 0;
    lastIndex.current = routeIndex;
    lastPath.current = pathname;
  }
  const handle = user?.github_username;

  return (
    <div className="portal-type min-h-screen bg-background text-foreground md:flex">
      {/* Phone drawer backdrop */}
      <div
        aria-hidden="true"
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-[#072033]/50 backdrop-blur-[2px] transition-opacity duration-300 md:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="portal-sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col overflow-y-auto p-5 transition-transform duration-300 ease-[cubic-bezier(.22,1,.36,1)] md:sticky md:top-0 md:z-auto md:h-screen md:w-64 md:max-w-none md:shrink-0 md:translate-x-0 sm:p-6 ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        } ${dark ? "scroll-dark bg-[#072033] text-white" : "border-r-2 border-[#CFE2EE] bg-white"}`}
      >
        {sidebar}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={`sticky top-0 z-30 flex h-16 items-center gap-3 border-b-2 px-4 backdrop-blur-xl sm:px-6 lg:px-10 ${
            dark ? "border-[#CFE2EE] bg-white/85" : "border-[#CFE2EE] bg-white/85"
          }`}
        >
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu portal"
            aria-controls="portal-sidebar"
            aria-expanded={drawerOpen}
            className="px-frame flex h-9 w-9 shrink-0 items-center justify-center bg-white text-secondary [--px-line:#CFE2EE] hover:text-foreground md:hidden"
          >
            <Icon name="menu" className="h-4 w-4" />
          </button>

          <p className="min-w-0 truncate font-mono text-xs text-secondary">
            <span className="font-semibold text-muara-ocean">{workspace}</span>
            {currentLabel ? ` · ${currentLabel}` : ""}
          </p>

          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="hidden items-center gap-1.5 px-2.5 py-1.5 font-mono text-xs font-semibold text-secondary transition-colors hover:bg-surface-alt hover:text-foreground sm:inline-flex"
            >
              <Icon name="public" className="h-4 w-4" />
              Lihat situs
            </Link>
            {handle && (
              <span className="px-chip hidden items-center gap-2 bg-white py-1 pl-1 pr-2.5 text-xs font-semibold text-foreground [--px-line:#CFE2EE] sm:inline-flex">
                <Image src={`https://github.com/${handle}.png`} alt="" width={24} height={24} unoptimized className="h-6 w-6 object-cover" />
                <span className="max-w-[10rem] truncate">{user?.full_name || `@${handle}`}</span>
              </span>
            )}
            <a
              href="/api/auth/logout"
              aria-label="Keluar"
              title="Keluar"
              className="px-frame flex h-9 w-9 items-center justify-center bg-white text-rose-700 transition-colors [--px-line:#FDA4AF] hover:bg-rose-50"
            >
              <Icon name="logout" className="h-4 w-4" />
            </a>
          </div>
        </header>

        <main className="w-full max-w-6xl flex-1 overflow-x-clip p-5 sm:p-8 lg:p-10">
          <motion.div
            key={pathname}
            initial={reducedMotion || direction.current === 0 ? false : { opacity: 0, x: direction.current * 28 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
