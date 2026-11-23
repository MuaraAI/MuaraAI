"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

type Phase = "idle" | "loading" | "done";

/**
 * Thin top loading bar for client navigations. Starts on internal link clicks / back-forward,
 * trickles toward 90%, then completes when the new route renders.
 */
export default function RouteProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const trickle = useRef<number | undefined>(undefined);

  useEffect(() => {
    const start = () => {
      window.clearInterval(trickle.current);
      setPhase("loading");
      setProgress(12);
      trickle.current = window.setInterval(() => {
        setProgress((p) => (p < 90 ? p + (90 - p) * 0.12 : p));
      }, 220);
    };

    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      const samePage = url.pathname === window.location.pathname && url.search === window.location.search;
      if (samePage) return; // hash jumps and no-op clicks
      start();
    };

    document.addEventListener("click", onClick, true);
    window.addEventListener("popstate", start);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.removeEventListener("popstate", start);
      window.clearInterval(trickle.current);
    };
  }, []);

  // A new route rendered: finish the bar and fade it out.
  useEffect(() => {
    if (phase !== "loading") return;
    window.clearInterval(trickle.current);
    setProgress(100);
    setPhase("done");
    const timer = window.setTimeout(() => {
      setPhase("idle");
      setProgress(0);
    }, 450);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px]"
      style={{ opacity: phase === "idle" ? 0 : 1, transition: "opacity .3s ease .15s" }}
    >
      <div
        className="relative h-full bg-[#0369A1]"
        style={{ width: `${progress}%`, transition: phase === "idle" ? "none" : "width .25s ease-out" }}
      >
        {/* Pixel "head" on the leading edge */}
        <span className="absolute -top-px right-0 h-[5px] w-[5px] bg-[#FCD34D]" />
      </div>
    </div>
  );
}
