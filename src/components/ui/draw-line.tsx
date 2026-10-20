"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

/** Dashed connector that draws left-to-right behind a row of steps (desktop only). */
export default function DrawLine({ className = "top-[58px]" }: { className?: string }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-x-[8%] hidden origin-left border-t-2 border-dashed border-[#9CC6E0] md:block ${className}`}
      initial={reducedMotion ? false : { scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.4, ease: [0.65, 0, 0.35, 1] }}
    />
  );
}
