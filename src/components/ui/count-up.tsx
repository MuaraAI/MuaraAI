"use client";

import React, { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";

const FORMATS = {
  idr: (n: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n),
  number: (n: number) => new Intl.NumberFormat("id-ID").format(n),
};

/**
 * Counts from 0 to `value` once visible. Server/no-JS render shows the final value;
 * the client resets to 0 on mount (while still off-screen) and counts up when scrolled into view.
 */
export default function CountUp({ value, format = "number" }: { value: number; format?: keyof typeof FORMATS }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(value);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (reducedMotion || value === 0 || typeof IntersectionObserver === "undefined") return;
    setDisplay(0);
    setArmed(true);
  }, [reducedMotion, value]);

  useEffect(() => {
    if (!armed || !inView) return;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [armed, inView, value]);

  return <span ref={ref}>{FORMATS[format](display)}</span>;
}
