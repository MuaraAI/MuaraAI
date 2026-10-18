"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "@/components/ui/icon";

type MemberShellProps = {
  member: {
    full_name: string;
    github_username: string;
    is_active: boolean;
    registration_status?: string;
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
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-white p-5 sm:p-6 flex flex-col shrink-0">
        <Link href="/" className="flex items-center gap-2 mb-6">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-alt border border-stroke text-muara-ocean font-display font-bold text-sm">M</span>
          <span className="font-display font-bold text-foreground text-base">Muara AI</span>
        </Link>

        <div className="rounded-lg border border-border bg-slate-50 p-3 mb-6">
          <div className="font-medium text-xs text-foreground truncate">{member.full_name}</div>
          <div className="text-[11px] font-mono text-slate-500">@{member.github_username}</div>
          <div className="mt-2 flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                member.registration_status === "pending"
                  ? "bg-amber-500 animate-pulse"
                  : member.is_active
                  ? "bg-status-success"
                  : "bg-status-danger"
              }`}
            />
            <span className="text-[10px] font-mono uppercase text-slate-600 font-semibold">
              {member.registration_status === "pending"
                ? "Menunggu review"
                : member.is_active
                ? "Member aktif"
                : "Akses ditangguhkan"}
            </span>
          </div>
        </div>

        <nav aria-label="Navigasi member" className="grid grid-cols-2 gap-1 md:block md:space-y-1 text-xs font-medium text-slate-700">
          {navItems.map((item) => {
            const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-11 items-center gap-2.5 rounded-lg px-3 py-2 transition-colors ${
                  active ? "bg-surface-alt text-foreground font-semibold" : "hover:bg-slate-100 hover:text-foreground"
                }`}
              >
                <Icon name={item.icon} className={`w-4 h-4 ${active ? "text-muara-ocean" : "text-secondary"}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-border mt-auto">
          <Link href="/" className="flex min-h-11 items-center gap-2 text-xs text-slate-500 hover:text-foreground transition-colors">
            <Icon name="arrow_back" className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </aside>
      <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
