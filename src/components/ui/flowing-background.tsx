"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

export default function FlowingBackground() {
  const reducedMotion = useReducedMotion();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
      <motion.div
        animate={reducedMotion ? undefined : { x: [0, 24, 0], y: [0, -16, 0] }}
        transition={reducedMotion ? undefined : { duration: 24, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 left-1/4 h-[560px] w-[680px] rounded-full bg-gradient-to-br from-sky-200/25 via-cyan-100/15 to-transparent blur-3xl opacity-60"
      />
    </div>
  );
}
