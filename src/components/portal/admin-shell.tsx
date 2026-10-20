"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Icon, { type IconName } from "@/components/ui/icon";
import PortalFrame, { type PortalUser } from "@/components/portal/portal-frame";

type AdminShellProps = { children: React.ReactNode; user?: PortalUser | null };
type AdminNavItem = { href: string; label: string; icon: IconName };

const adminItems: AdminNavItem[] = [
  { href: "/admin/review", label: "Review pendaftar", icon: "how_to_reg" },
  { href: "/admin/members", label: "Anggota", icon: "group" },
  { href: "/admin/treasury", label: "Kas", icon: "account_balance_wallet" },
  { href: "/admin/learn", label: "Materi", icon: "school" },
  { href: "/admin/achievements", label: "Prestasi", icon: "workspace_premium" },
];

export default function AdminShell({ children, user }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <PortalFrame
      variant="admin"
      user={user}
      currentLabel={adminItems.find((item) => pathname?.startsWith(item.href))?.label}
      order={adminItems.map((item) => item.href)}
      sidebar={
        <>
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 text-white">
          <span className="px-frame flex h-8 w-8 items-center justify-center overflow-hidden bg-white [--px-line:#5FA3CC]">
            <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" />
          </span>
          <span className="font-display font-bold text-base">Muara Operations</span>
        </Link>

        <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.16em] text-sky-300">Maintainer workspace</div>
        <nav aria-label="Navigasi maintainer" className="space-y-1 text-xs font-medium text-slate-200">
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-2.5 px-3 py-2 font-mono transition-colors duration-200 ${
                  active ? "font-semibold text-[#072033]" : "hover:bg-white/10 hover:text-white"
                }`}
              >
                {active && (
                  <motion.span layoutId="admin-nav-active" className="absolute inset-0 bg-white shadow-[inset_3px_0_0_#FCD34D]" transition={{ type: "spring", stiffness: 420, damping: 38 }} />
                )}
                <Icon name={item.icon} className={`relative w-4 h-4 ${active ? "text-muara-ocean" : "text-sky-300"}`} />
                <span className="relative">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-1 border-t-2 border-dashed border-white/15 pt-4 text-xs md:mt-auto">
          <Link href="/dashboard" className="flex min-h-11 items-center gap-2 px-3 font-mono text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
            <Icon name="arrow_back" className="h-4 w-4" />
            Workspace anggota
          </Link>
          <a href="/api/auth/logout" className="flex min-h-11 items-center gap-2 px-3 font-mono text-rose-300 transition-colors hover:bg-white/10 hover:text-rose-200">
            <Icon name="logout" className="h-4 w-4" />
            Keluar
          </a>
        </div>
        </>
      }
    >
      {children}
    </PortalFrame>
  );
}
