"use client";

import Link from "next/link";
import React, { useState } from "react";
import { GITHUB_ORG_URL } from "@/lib/constants";

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
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface border border-muara-cyan/30 text-muara-cyan font-display font-bold text-lg group-hover:border-muara-cyan transition-colors">
              M
            </span>
            <span className="font-display font-bold text-lg tracking-tight text-white group-hover:text-muara-cyan transition-colors">
              Muara AI
            </span>
          </Link>
          <span className="hidden sm:inline-flex items-center rounded-full bg-surface border border-border px-2.5 py-0.5 text-xs font-mono text-muara-cyan">
            v1.0 • Pontianak
          </span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/#projects" className="hover:text-muara-cyan transition-colors">
            Projects
          </Link>
          <Link href="/#accolades" className="hover:text-muara-cyan transition-colors">
            Accolades
          </Link>
          <Link href="/#manifesto" className="hover:text-muara-cyan transition-colors">
            Manifesto
          </Link>
          <Link href="/#syndicate" className="hover:text-muara-cyan transition-colors">
            The Syndicate
          </Link>
          <Link href="/#treasury" className="hover:text-muara-cyan transition-colors">
            Treasury
          </Link>
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href={GITHUB_ORG_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
            aria-label="GitHub Organization"
          >
            <span className="material-symbols-rounded text-xl">terminal</span>
          </Link>

          {user ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-lg bg-surface hover:bg-surface-hover border border-muara-cyan/30 hover:border-muara-cyan px-4 py-2 text-xs font-semibold text-white transition-colors"
            >
              <span className="material-symbols-rounded text-base text-muara-cyan">dashboard</span>
              Dashboard
            </Link>
          ) : (
            <Link
              href="/api/auth/login"
              className="inline-flex items-center gap-2 rounded-lg bg-muara-cyan hover:bg-muara-cyan-light text-background px-4 py-2 text-xs font-bold transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <span className="material-symbols-rounded text-base">login</span>
              Login with GitHub
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-surface text-slate-300 hover:text-white"
            aria-label="Toggle Menu"
          >
            <span className="material-symbols-rounded">
              {mobileMenuOpen ? "close" : "menu"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface/95 backdrop-blur-lg px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/#projects"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-muara-cyan"
          >
            Projects
          </Link>
          <Link
            href="/#accolades"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-muara-cyan"
          >
            Accolades
          </Link>
          <Link
            href="/#manifesto"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-muara-cyan"
          >
            Manifesto
          </Link>
          <Link
            href="/#syndicate"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-muara-cyan"
          >
            The Syndicate
          </Link>
          <Link
            href="/#treasury"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-sm font-medium text-slate-300 hover:text-muara-cyan"
          >
            Treasury
          </Link>
          <div className="pt-2 border-t border-border/50">
            {user ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-surface-hover border border-muara-cyan/30 py-2.5 text-xs font-semibold text-white"
              >
                <span className="material-symbols-rounded text-base text-muara-cyan">dashboard</span>
                Dashboard
              </Link>
            ) : (
              <Link
                href="/api/auth/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-muara-cyan py-2.5 text-xs font-bold text-background"
              >
                <span className="material-symbols-rounded text-base">login</span>
                Login with GitHub
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
