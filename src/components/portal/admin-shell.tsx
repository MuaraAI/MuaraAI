"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/icon";

type AdminShellProps = { children: React.ReactNode };
type AdminNavItem = { href: string; label: string; icon: IconName };

const adminItems: AdminNavItem[] = [
  { href: "/admin/review", label: "Review pendaftar", icon: "how_to_reg" },
  { href: "/admin/members", label: "Anggota", icon: "group" },
  { href: "/admin/treasury", label: "Kas", icon: "account_balance_wallet" },
  { href: "/admin/learn", label: "Materi", icon: "school" },
  { href: "/admin/mail", label: "Pesan", icon: "mail" },
  { href: "/admin/achievements", label: "Prestasi", icon: "workspace_premium" },
];

export default function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-[#072033] p-5 sm:p-6 flex flex-col shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 mb-8 text-white">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-white/10 border border-white/20 text-sky-300 font-display font-bold text-sm">M</span>
          <span className="font-display font-bold text-base">Muara Operations</span>
        </Link>

        <div className="mb-5 text-[10px] font-mono uppercase tracking-[0.16em] text-sky-300">Maintainer workspace</div>
        <nav aria-label="Navigasi maintainer" className="grid grid-cols-2 gap-1 md:block md:space-y-1 text-xs font-medium text-slate-200">
          {adminItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                  active ? "bg-white text-[#072033] font-semibold" : "hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon name={item.icon} className={`w-4 h-4 ${active ? "text-muara-ocean" : "text-sky-300"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-white/15 mt-auto">
          <Link href="/dashboard" className="flex min-h-11 items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors">
            <Icon name="arrow_back" className="w-4 h-4" />
            Kembali ke workspace
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
