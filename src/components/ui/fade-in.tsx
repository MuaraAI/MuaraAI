"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "none";
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  className = "",
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  const offsets: Record<string, { x?: number; y?: number }> = {
    up: { y: 24, x: 0 },
    down: { y: -24, x: 0 },
    left: { x: 24, y: 0 },
    right: { x: -24, y: 0 },
  };
  const offset = offsets[direction] ?? { x: 0, y: 0 };

  return (
    <motion.div
      initial={reducedMotion ? false : { opacity: 0, ...offset }}
      whileInView={reducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={
        reducedMotion
          ? undefined
          : { duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }
      }
      className={className}
    >
      {children}
    </motion.div>
  );
}
