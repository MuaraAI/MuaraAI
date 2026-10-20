"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import TypeText from "@/components/ui/type-text";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Hero title: the first two lines rise out of a mask, then "berkontribusi." types itself in. */
export default function HeroHeadline() {
  const reducedMotion = useReducedMotion();
  const line = (text: string, index: number) => (
    <span className="block overflow-hidden pb-[0.08em]">
      <motion.span
        className="block"
        initial={reducedMotion ? false : { y: "105%" }}
        animate={{ y: 0 }}
        transition={{ duration: 0.85, delay: 0.1 + index * 0.12, ease: EASE_OUT_EXPO }}
      >
        {text}
      </motion.span>
    </span>
  );

  return (
    <h1 className="max-w-4xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
      {line("Belajar,", 0)}
      {line("membangun,", 1)}
      <TypeText text="berkontribusi." className="block text-muara-ocean" speed={55} delay={0.55} />
    </h1>
  );
}
