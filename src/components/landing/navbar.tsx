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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-white/85 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-muara-sky border border-muara-ocean/30 text-muara-ocean font-display font-bold text-lg group-hover:border-muara-ocean transition-colors shadow-sm">
              M
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-foreground group-hover:text-muara-ocean transition-colors">
              Muara AI
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#projects" className="hover:text-muara-ocean transition-colors">
            Projects
          </Link>
          <Link href="/#accolades" className="hover:text-muara-ocean transition-colors">
            Accolades
          </Link>
          <Link href="/#manifesto" className="hover:text-muara-ocean transition-colors">
            Manifesto
          </Link>
          <Link href="/#syndicate" className="hover:text-muara-ocean transition-colors">
            The Syndicate
          </Link>
          <Link href="/#treasury" className="hover:text-muara-ocean transition-colors">
            Treasury
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-foreground transition-colors p-1"
            aria-label="GitHub Organization"
          >
            <Icon name="terminal" className="w-5 h-5" />
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-surface hover:bg-surface-alt border border-border-ocean hover:border-muara-ocean px-4 py-2 text-xs font-semibold text-foreground transition-colors shadow-sm"
            >
              <Icon name="dashboard" className="w-4 h-4 text-muara-ocean" />
              Dashboard
            </Link>
          ) : (
            <Link
              href="/api/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-4 py-2 text-xs font-bold transition-colors shadow-sm"
            >
              <Icon name="login" className="w-4 h-4 text-white" />
              Login with GitHub
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-slate-600 hover:text-foreground"
            aria-label="Toggle Menu"
          >
            <Icon name={mobileMenuOpen ? "close" : "menu"} className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-white/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-muara-ocean"
          >
            Projects
          </Link>
          <Link
            href="/#accolades"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-muara-ocean"
          >
            Accolades
          </Link>
          <Link
            href="/#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-muara-ocean"
          >
            Manifesto
          </Link>
          <Link
            href="/#syndicate"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-muara-ocean"
          >
            The Syndicate
          </Link>
          <Link
            href="/#treasury"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-600 hover:text-muara-ocean"
          >
            Treasury
          </Link>
          <div className="pt-2 border-t border-border">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface border border-border-ocean py-2.5 text-xs font-semibold text-foreground shadow-sm"
              >
                <Icon name="dashboard" className="w-4 h-4 text-muara-ocean" />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/api/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-muara-ocean py-2.5 text-xs font-bold text-white shadow-sm"
              >
                <Icon name="login" className="w-4 h-4 text-white" />
                Login with GitHub
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
