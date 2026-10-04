"use client";

import Link from "next/link";
import React, { useState } from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";

interface NavbarProps {
  user?: {
    id: string;
    fullName?: string;
    roleTitle?: string;
  } | null;
}

export default function Navbar({ user }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-3 sm:top-4 z-50 w-full px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <nav className="flex items-center justify-between rounded-full border border-stroke bg-white/90 backdrop-blur-md px-4 sm:px-6 py-2.5 shadow-diffusion transition-all">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5 group">
            <span className="flex h-8 w-8 items-center justify-center rounded-[8px] bg-surface-alt border border-stroke text-muara-ocean font-display font-bold text-base group-hover:border-muara-ocean transition-colors shadow-xs">
              <Icon name="waves" className="w-4 h-4 text-muara-ocean" />
            </span>
            <span className="font-display font-bold text-base tracking-tight text-foreground group-hover:text-muara-ocean transition-colors">
              Muara AI
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-7 text-xs font-mono font-medium text-secondary">
          <Link href="/#projects" className="hover:text-foreground transition-colors">
            Projects
          </Link>
          <Link href="/#accolades" className="hover:text-foreground transition-colors">
            Accolades
          </Link>
          <Link href="/#manifesto" className="hover:text-foreground transition-colors">
            Manifesto
          </Link>
          <Link href="/members" className="hover:text-foreground transition-colors">
            Anggota
          </Link>
          <Link href="/#syndicate" className="hover:text-foreground transition-colors">
            Maintainers
          </Link>
          <Link href="/#treasury" className="hover:text-foreground transition-colors">
            Treasury
          </Link>
        </div>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt border border-stroke px-2.5 py-0.5 text-[11px] font-mono font-semibold text-status-success">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>v2-alpha</span>
          </span>

          <Link
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-foreground transition-colors p-1"
            aria-label="GitHub Organization"
          >
            <Icon name="code" className="w-4 h-4" />
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface-alt hover:bg-slate-100 border border-stroke px-3.5 py-1.5 text-xs font-mono font-semibold text-foreground transition-colors shadow-xs"
            >
              <Icon name="dashboard" className="w-3.5 h-3.5 text-muara-ocean" />
              <span>Dashboard</span>
            </Link>
          ) : (
            <Link
              href="/api/auth/login"
              className="inline-flex items-center gap-1.5 rounded-full bg-foreground hover:bg-secondary text-white px-4 py-1.5 text-xs font-sans font-bold transition-all shadow-xs"
            >
              <Icon name="login" className="w-3.5 h-3.5 text-white" />
              <span>Login</span>
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stroke bg-white text-secondary hover:text-foreground"
            aria-label="Toggle Menu"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 rounded-2xl border border-stroke bg-white/95 backdrop-blur-lg p-5 shadow-diffusion space-y-3 font-mono text-xs">
          <Link
            href="/#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Projects
          </Link>
          <Link
            href="/#accolades"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Accolades
          </Link>
          <Link
            href="/#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Manifesto
          </Link>
          <Link
            href="/members"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Anggota
          </Link>
          <Link
            href="/#syndicate"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Maintainers
          </Link>
          <Link
            href="/#treasury"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-secondary hover:text-foreground"
          >
            Treasury
          </Link>
          <div className="pt-2 border-t border-stroke">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-alt border border-stroke py-2 text-xs font-semibold text-foreground shadow-xs font-sans"
              >
                <Icon name="dashboard" className="w-4 h-4 text-muara-ocean" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <Link
                href="/api/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-foreground py-2 text-xs font-bold text-white shadow-xs font-sans"
              >
                <Icon name="login" className="w-4 h-4 text-white" />
                <span>Login with GitHub</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
