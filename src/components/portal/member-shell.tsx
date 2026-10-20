"use client";

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import Icon, { type IconName } from "@/components/ui/icon";
import PortalFrame, { type PortalUser } from "@/components/portal/portal-frame";

type MemberShellProps = {
  member: {
    full_name: string;
    github_username: string;
    is_active: boolean;
    registration_status?: string;
    is_maintainer?: boolean;
  };
  children: React.ReactNode;
};

type NavItem = { href: string; label: string; icon: IconName };

const navItems: NavItem[] = [
  { href: "/dashboard", label: "Beranda", icon: "dashboard" },
  { href: "/dashboard/learn", label: "Belajar", icon: "school" },
  { href: "/dashboard/treasury", label: "Kas", icon: "account_balance_wallet" },
];

export default function MemberShell({ member, children }: MemberShellProps) {
  const pathname = usePathname();

  return (
    <PortalFrame
      variant="member"
      user={member}
      currentLabel={navItems.find((item) => (item.href === "/dashboard" ? pathname === "/dashboard" : pathname?.startsWith(item.href)))?.label}
      order={navItems.map((item) => item.href)}
      sidebar={
        <>
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="px-frame flex h-8 w-8 items-center justify-center overflow-hidden bg-white [--px-line:#CFE2EE]">
            <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" />
          </span>
          <span className="font-display font-bold text-foreground text-base">Muara AI</span>
        </Link>

        <div className="px-frame mb-6 bg-surface-alt p-3 [--px-line:#CFE2EE]">
          <div className="font-medium text-xs text-foreground truncate">{member.full_name}</div>
          <div className="text-[11px] font-mono text-slate-500">@{member.github_username}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 ${
                member.registration_status === "pending"
                  ? "bg-amber-500 animate-pulse"
                  : member.registration_status === "rejected"
                  ? "bg-rose-500"
                  : member.is_active
                  ? "bg-status-success"
                  : "bg-status-danger"
              }`}
            />
            <span className="text-[10px] font-mono uppercase text-slate-600 font-semibold">
              {member.registration_status === "pending"
                ? "Menunggu review"
                : member.registration_status === "rejected"
                ? "Pendaftaran ditolak"
                : member.is_active
                ? "Member aktif"
                : "Akses ditangguhkan"}
            </span>
          </div>
        </div>

        <nav aria-label="Navigasi member" className="space-y-1 text-xs font-medium text-slate-700">
          {navItems.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 items-center gap-2.5 px-3 py-2 font-mono transition-colors duration-200 ${
                  active ? "font-semibold text-foreground" : "hover:bg-surface-alt hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span layoutId="member-nav-active" className="absolute inset-0 bg-[#DCEBF5] shadow-[inset_3px_0_0_#0369A1]" transition={{ type: "spring", stiffness: 420, damping: 38 }} />
                )}
                <Icon name={item.icon} className={`relative w-4 h-4 ${active ? "text-muara-ocean" : "text-secondary"}`} />
                <span className="relative">{item.label}</span>
                {item.href !== "/dashboard" && member.registration_status !== "approved" && (
                  <Icon name="lock" className="relative ml-auto w-3.5 h-3.5 text-slate-400" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-6 space-y-1 border-t-2 border-dashed border-[#CFE2EE] pt-4 text-xs md:mt-auto">
          {member.is_maintainer && (
            <Link href="/admin/review" className="flex min-h-11 items-center gap-2 px-3 font-mono font-semibold text-muara-ocean transition-colors hover:bg-surface-alt">
              <Icon name="shield" className="h-4 w-4" />
              Workspace Admin
            </Link>
          )}
          <Link href="/" className="flex min-h-11 items-center gap-2 px-3 font-mono text-secondary transition-colors hover:bg-surface-alt hover:text-foreground">
            <Icon name="arrow_back" className="h-4 w-4" />
            Situs MuaraAI
          </Link>
          <a href="/api/auth/logout" className="flex min-h-11 items-center gap-2 px-3 font-mono text-rose-700 transition-colors hover:bg-rose-50">
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
