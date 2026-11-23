"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";

type Direction = "up" | "down" | "left" | "right" | "none";

interface FadeInProps {
  children: React.ReactNode;
  delay?: number;
  /** Where the element comes from: "left" slides in from the left edge, "right" from the right. */
  direction?: Direction;
  distance?: number;
  className?: string;
  as?: "div" | "li" | "span";
}

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export default function FadeIn({
  children,
  delay = 0,
  direction = "up",
  distance = 28,
  className = "",
  as = "div",
}: FadeInProps) {
  const reducedMotion = useReducedMotion();
  const offsets: Record<Direction, { x: number; y: number }> = {
    up: { x: 0, y: distance },
    down: { x: 0, y: -distance },
    left: { x: -distance, y: 0 },
    right: { x: distance, y: 0 },
    none: { x: 0, y: 0 },
  };
  const Component = motion[as];

  return (
    <Component
      initial={reducedMotion ? false : { opacity: 0, ...offsets[direction] }}
      whileInView={reducedMotion ? undefined : { opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -60px 0px" }}
      transition={reducedMotion ? undefined : { duration: 0.7, delay, ease: EASE_OUT_EXPO }}
      className={className}
    >
      {children}
    </Component>
  );
}
