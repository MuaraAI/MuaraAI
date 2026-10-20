"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { MotionConfig, motion, useScroll, useSpring, useTransform } from "motion/react";
import { GITHUB_ORG_URL } from "@/lib/constants";
import Icon from "@/components/ui/icon";

interface NavbarProps {
  user?: {
    id: string;
    fullName?: string;
    roleTitle?: string;
  } | null;
}

const NAV_LINKS = [
  { href: "/#projects", label: "Project" },
  { href: "/members", label: "Anggota" },
  { href: "/onboarding", label: "Daftar" },
];

// Scroll distance (px) over which the floating bar morphs into the docked bar.
const DOCK_DISTANCE = 120;

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const closeMenu = useCallback(() => setMobileMenuOpen(false), []);
  // Keep the takeover mounted while its reverse sweep plays, then drop it.
  const [menuMounted, setMenuMounted] = useState(false);
  useEffect(() => {
    if (mobileMenuOpen) {
      setMenuMounted(true);
      return;
    }
    const timer = window.setTimeout(() => setMenuMounted(false), 900);
    return () => window.clearTimeout(timer);
  }, [mobileMenuOpen]);

  // Scroll-linked, spring-smoothed progress: 0 = floating pixel bar, 1 = docked full-width bar.
  const { scrollY } = useScroll();
  const progress = useSpring(useTransform(scrollY, [0, DOCK_DISTANCE], [0, 1], { clamp: true }), {
    stiffness: 220,
    damping: 32,
    mass: 0.6,
  });

  // Floating frame lines up with the hero's 100rem content box (gutters sit outside it).
  const maxWidth = useTransform(
    progress,
    (v) => `calc((100rem + 2 * var(--nav-gutter)) + (100vw - (100rem + 2 * var(--nav-gutter))) * ${v.toFixed(4)})`,
  );
  const gutter = useTransform(progress, (v) => `calc(var(--nav-gutter) * ${(1 - v).toFixed(4)})`);
  const top = useTransform(progress, (v) => `${(12 * (1 - v)).toFixed(2)}px`);
  const edge = useTransform(progress, (v) => `rgba(22, 58, 85, ${(0.85 * (1 - v)).toFixed(3)})`);
  const bottom = useTransform(progress, (v) => {
    // #163A55 at the top → #D9E5ED (stroke) when docked.
    const mix = (a: number, b: number) => Math.round(a + (b - a) * v);
    return `rgb(${mix(22, 217)}, ${mix(58, 229)}, ${mix(85, 237)})`;
  });
  const drop = useTransform(progress, (v) => `${(4 * (1 - v)).toFixed(2)}px`);
  const bg = useTransform(progress, (v) => (0.62 + 0.3 * v).toFixed(3));

  const activeHref = NAV_LINKS.find((link) => !link.href.includes("#") && pathname?.startsWith(link.href))?.href ?? null;
  const highlightedHref = hovered ?? activeHref;

  // A single, always-mounted highlight that slides to the lit link (no mount/unmount, so no flash).
  const linkRefs = useRef<Record<string, HTMLAnchorElement | null>>({});
  const [pill, setPill] = useState<{ x: number; width: number } | null>(null);
  useEffect(() => {
    const measure = () => {
      const el = highlightedHref ? linkRefs.current[highlightedHref] : null;
      // With nothing lit, keep the last position so the highlight fades out in place.
      setPill((prev) => (el ? { x: el.offsetLeft, width: el.offsetWidth } : prev));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [highlightedHref]);

  return (
    <MotionConfig reducedMotion="user">
      <header className="fixed inset-x-0 top-0 z-50 [--nav-gutter:1rem] sm:[--nav-gutter:1.5rem] lg:[--nav-gutter:2rem]">
        {/* Mobile menu sits behind the bar (negative z inside the header's stacking context). */}
        {menuMounted && (
          <PixelTakeover open={mobileMenuOpen} links={NAV_LINKS} activeHref={activeHref} user={user} onClose={closeMenu} />
        )}
        <motion.div className="mx-auto" style={{ maxWidth, paddingLeft: gutter, paddingRight: gutter, paddingTop: top }}>
          <motion.nav
            className="px-nav relative isolate"
            data-menu-open={mobileMenuOpen ? "true" : undefined}
            style={{
              ["--nav-edge" as string]: edge,
              ["--nav-bottom" as string]: bottom,
              ["--nav-off" as string]: drop,
              ["--nav-bg" as string]: bg,
            }}
          >
            {/* Blur lives on its own layer so animating children never force the backdrop to repaint. */}
            <span className="pointer-events-none absolute inset-0 -z-10 backdrop-blur-xl backdrop-saturate-150 [transform:translateZ(0)]" aria-hidden="true" />
            <div className="mx-auto flex max-w-[100rem] items-center justify-between px-4 py-2.5 sm:px-5 lg:px-6">
              {/* Brand */}
              <Link href="/" className="group flex items-center gap-2.5">
                <span className="px-frame flex h-8 w-8 items-center justify-center overflow-hidden bg-white [--px-line:#CFE2EE] group-hover:[--px-line:#0369A1]">
                  <Image src="/brand/muara-logo.png" alt="" width={32} height={32} className="h-7 w-7 object-contain" priority />
                </span>
                <span className="nav-brand-text font-display text-base font-bold tracking-tight text-foreground transition-colors duration-300 group-hover:text-muara-ocean">
                  Muara AI
                </span>
              </Link>

              {/* Desktop Navigation: one highlight glides between links. */}
              <div className="relative hidden items-center gap-1.5 md:flex" onMouseLeave={() => setHovered(null)}>
                <motion.span
                  className="px-nav-highlight pointer-events-none absolute inset-y-0 left-0"
                  initial={false}
                  animate={pill ? { x: pill.x, width: pill.width, opacity: highlightedHref ? 1 : 0 } : { opacity: 0 }}
                  transition={{ x: { type: "spring", stiffness: 420, damping: 36 }, width: { type: "spring", stiffness: 420, damping: 36 }, opacity: { duration: 0.2 } }}
                  aria-hidden="true"
                />
                {NAV_LINKS.map((link) => {
                  const isActive = activeHref === link.href;
                  const isLit = highlightedHref === link.href;
                  return (
                    <Link
                      key={link.href}
                      ref={(el) => {
                        linkRefs.current[link.href] = el;
                      }}
                      href={link.href}
                      onMouseEnter={() => setHovered(link.href)}
                      onFocus={() => setHovered(link.href)}
                      onBlur={() => setHovered(null)}
                      aria-current={isActive ? "page" : undefined}
                      className={`relative px-4 py-2 font-mono text-xs font-semibold transition-colors duration-300 ${
                        isLit ? "text-foreground" : "text-secondary"
                      }`}
                    >
                      <span className="relative">{link.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Right Actions */}
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href={GITHUB_ORG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-secondary transition-colors duration-300 hover:bg-[#E1EEF7] hover:text-foreground"
                  aria-label="GitHub Organization"
                >
                  <Icon name="github" className="h-4 w-4" />
                </Link>

                {user ? (
                  <Link href="/dashboard" className="px-btn-ghost inline-flex items-center gap-1.5 px-3.5 py-1.5 font-mono text-xs font-semibold [--px-off:3px]">
                    <Icon name="dashboard" className="h-3.5 w-3.5 text-muara-ocean" />
                    <span>Dashboard</span>
                  </Link>
                ) : (
                  <>
                    <Link href="/login" className="px-btn-ghost inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold [--px-off:3px]">
                      <Icon name="login" className="h-3.5 w-3.5" />
                      <span>Masuk</span>
                    </Link>
                    <Link href="/onboarding" className="px-btn inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold [--px-off:3px]">
                      <span>Daftar</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="nav-menu-button px-frame flex h-9 w-9 items-center justify-center bg-white/80 text-secondary transition-colors duration-300 [--px-line:#CFE2EE] hover:text-foreground md:hidden"
                aria-label="Toggle Menu"
                aria-expanded={mobileMenuOpen}
              >
                <PixelBurger open={mobileMenuOpen} />
              </button>
            </div>
          </motion.nav>

        </motion.div>
      </header>
      {/* Reserves the bar's height since the header is fixed (keeps content from jumping while it docks). */}
      <div className="h-[72px]" aria-hidden="true" />
    </MotionConfig>
  );
}


const TILE = 44;

/** Hamburger built from three 2px bars that fold into an X. */
function PixelBurger({ open }: { open: boolean }) {
  const spring = { type: "spring" as const, stiffness: 500, damping: 30 };
  return (
    <span className="relative block h-3 w-4" aria-hidden="true">
      <motion.span className="absolute left-0 top-0 block h-[2px] w-4 bg-current" animate={open ? { y: 5, rotate: 45 } : { y: 0, rotate: 0 }} transition={spring} />
      <motion.span className="absolute left-0 top-[5px] block h-[2px] w-4 bg-current" animate={open ? { scaleX: 0, opacity: 0 } : { scaleX: 1, opacity: 1 }} transition={{ duration: 0.15 }} />
      <motion.span className="absolute left-0 top-[10px] block h-[2px] w-4 bg-current" animate={open ? { y: -5, rotate: -45 } : { y: 0, rotate: 0 }} transition={spring} />
    </span>
  );
}

// Deterministic sprinkle of lighter tiles so the takeover reads as pixel art, not a flat fill.
function tileColor(c: number, r: number) {
  const h = (c * 73 + r * 151) % 29;
  if (h === 0) return "#0369A1";
  if (h === 7 || h === 19) return "#0B2D46";
  return "#072033";
}

/**
 * Mobile menu: tiles sweep in diagonally, then the links type themselves in.
 * Everything is CSS transitions on transform/opacity/clip-path (GPU-friendly, no per-frame JS).
 */
function PixelTakeover({
  open,
  links,
  activeHref,
  user,
  onClose,
}: {
  open: boolean;
  links: typeof NAV_LINKS;
  activeHref: string | null;
  user: NavbarProps["user"];
  onClose: () => void;
}) {
  // Only ever mounted after a tap (client-side), so the viewport is known synchronously:
  // tiles exist in their hidden state on the very first paint, which keeps the transition reliable.
  const [grid] = useState(() => ({ cols: Math.ceil(window.innerWidth / TILE), rows: Math.ceil(window.innerHeight / TILE) }));
  const [shown, setShown] = useState(false);
  const [cursor, setCursor] = useState<string | null>(activeHref ?? links[0].href);

  // Flip after two frames so the hidden state is painted first, then transitioned (opening and closing).
  useEffect(() => {
    let second = 0;
    const first = window.requestAnimationFrame(() => {
      second = window.requestAnimationFrame(() => setShown(open));
    });
    return () => {
      window.cancelAnimationFrame(first);
      window.cancelAnimationFrame(second);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const onResize = () => window.innerWidth >= 768 && onClose();
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open, onClose]);

  const span = grid.cols + grid.rows;

  return (
    <div className={`px-takeover fixed inset-0 -z-10 md:hidden ${open ? "" : "pointer-events-none"}`} data-open={shown}>
      {(
        <div
          className="absolute inset-0 grid overflow-hidden"
          style={{ gridTemplateColumns: `repeat(${grid.cols}, ${TILE}px)`, gridAutoRows: `${TILE}px` }}
          aria-hidden="true"
        >
          {Array.from({ length: grid.cols * grid.rows }, (_, i) => {
            const c = i % grid.cols;
            const r = Math.floor(i / grid.cols);
            return (
              <span
                key={i}
                className="px-tile"
                data-accent={tileColor(c, r) === "#0369A1" ? "" : undefined}
                style={{
                  backgroundColor: tileColor(c, r),
                  ["--d-in" as string]: `${(c + r) * 22}ms`,
                  ["--d-out" as string]: `${(span - (c + r)) * 14}ms`,
                }}
              />
            );
          })}
        </div>
      )}

      <nav aria-label="Menu utama" className="px-takeover-content relative flex h-full flex-col px-6 pb-8 pt-28">
        <p className="px-line font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#5FA3CC]" style={{ ["--i" as string]: 0 }}>
          // Menu
        </p>
        <ul className="mt-5 flex flex-col gap-2">
          {links.map((link, i) => {
            const lit = cursor === link.href;
            return (
              <li key={link.href} className="px-line" style={{ ["--i" as string]: i + 1 }}>
                <Link
                  href={link.href}
                  onClick={onClose}
                  onMouseEnter={() => setCursor(link.href)}
                  onFocus={() => setCursor(link.href)}
                  aria-current={activeHref === link.href ? "page" : undefined}
                  className="flex items-baseline gap-4 py-2"
                >
                  <span className={`font-mono text-xs font-bold transition-colors duration-200 ${lit ? "text-[#FCD34D]" : "text-[#5FA3CC]"}`}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className={`font-display text-4xl font-bold tracking-tight transition-colors duration-200 ${lit ? "text-white" : "text-white/55"}`}>
                    {link.label}
                  </span>
                  {lit && <span className="px-cursor h-7 w-3 self-center bg-[#FCD34D]" aria-hidden="true" />}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="px-line mt-auto" style={{ ["--i" as string]: links.length + 1 }}>
          <div className="grid grid-cols-2 gap-4 pb-1 pr-1">
            {user ? (
              <Link href="/dashboard" onClick={onClose} className="px-btn-ocean col-span-2 flex min-h-12 items-center justify-center gap-2 text-sm font-bold">
                <Icon name="dashboard" className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={onClose} className="px-btn-night flex min-h-12 items-center justify-center gap-2 text-sm font-semibold">
                  <Icon name="login" className="h-4 w-4" />
                  <span>Masuk</span>
                </Link>
                <Link href="/onboarding" onClick={onClose} className="px-btn-ocean flex min-h-12 items-center justify-center gap-2 text-sm font-bold">
                  <span>Daftar</span>
                </Link>
              </>
            )}
          </div>
          <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.25em] text-white/40">MuaraAI · Lahir di Pontianak</p>
        </div>
      </nav>
    </div>
  );
}
