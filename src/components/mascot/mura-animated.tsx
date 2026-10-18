"use client";

import React from "react";
import Image from "next/image";
import {
  motion,
  type TargetAndTransition,
  type Transition,
} from "motion/react";
import { useSyncExternalStore } from "react";

export type MuraPose =
  | "welcome"
  | "learning"
  | "building"
  | "empty"
  | "maintenance"
  | "not-found";

export const MURA_POSE_ASSETS: Record<MuraPose, string> = {
  welcome: "/mascot/mura/welcome-onboarding-1.jpeg",
  learning: "/mascot/mura/learning-learn-2.jpeg",
  building: "/mascot/mura/building-project-workspace-3.jpeg",
  empty: "/mascot/mura/empty-state-nothing-yet-5.jpeg",
  maintenance: "/mascot/mura/error-maintenance-needs-attention-6.jpeg",
  "not-found": "/mascot/mura/404-7.jpeg",
};

export type MuraAnimatedProps = {
  pose: MuraPose;
  /** Meaningful description. Ignored (rendered as alt="") when `decorative` is true. */
  alt: string;
  /** Set only when adjacent text already conveys everything the image does. */
  decorative?: boolean;
  className?: string;
  priority?: boolean;
  /**
   * Adds a 2px hover lift (pointer devices only). The component never renders a
   * button or link: wrap it in a real one from the caller.
   */
  interactive?: boolean;
  sizes?: string;
  "data-testid"?: string;
};

// Hydro easing from Fluid Currents.
const HYDRO: [number, number, number, number] = [0.16, 1, 0.3, 1];

type Preset = {
  initial: TargetAndTransition;
  animate: TargetAndTransition;
  transition: Transition;
  /** Play when scrolled into view instead of on mount. */
  inView?: boolean;
};

// One entrance + at most one state gesture per pose. Transform/opacity only.
const PRESETS: Record<MuraPose, Preset> = {
  welcome: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: [0, 1, 1, 1], y: [10, 0, -4, 0] },
    transition: { duration: 1.6, times: [0, 0.35, 0.65, 1], ease: HYDRO },
  },
  learning: {
    initial: { opacity: 0, y: 8, rotate: -1 },
    animate: { opacity: 1, y: 0, rotate: 0 },
    transition: { duration: 0.8, ease: HYDRO },
  },
  building: {
    initial: { opacity: 0, x: 8, scale: 1 },
    animate: { opacity: [0, 1, 1, 1], x: [8, 0, 0, 0], scale: [1, 1, 1.015, 1] },
    transition: { duration: 1.4, times: [0, 0.4, 0.7, 1], ease: HYDRO },
    inView: true,
  },
  empty: {
    initial: { opacity: 0, y: 8, rotate: -1 },
    animate: { opacity: [0, 1, 1], y: [8, 0, 0], rotate: [-1, 1, 0] },
    transition: { duration: 1.2, times: [0, 0.5, 1], ease: HYDRO },
  },
  maintenance: {
    initial: { opacity: 0, y: 8, rotate: 0 },
    animate: { opacity: [0, 1, 1, 1], y: [8, 0, 0, 0], rotate: [0, 0, -1.5, 0] },
    transition: { duration: 1.4, times: [0, 0.4, 0.7, 1], ease: HYDRO },
  },
  "not-found": {
    initial: { opacity: 0, y: 8, rotate: -1, x: 0 },
    animate: {
      opacity: [0, 1, 1, 1],
      y: [8, 0, 0, 0],
      rotate: [-1, 0, 0, 0],
      x: [0, 0, 4, 0],
    },
    transition: { duration: 1.4, times: [0, 0.4, 0.7, 1], ease: HYDRO },
  },
};

const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return () => {};
  }
  const mq = window.matchMedia(REDUCED_QUERY);
  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }
  mq.addListener?.(onChange);
  return () => mq.removeListener?.(onChange);
}

function getSnapshot() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
    return false;
  }
  return window.matchMedia(REDUCED_QUERY).matches;
}

function useReducedMotionSafe() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false);
}

export function MuraAnimated({
  pose,
  alt,
  decorative = false,
  className,
  priority = false,
  interactive = false,
  sizes = "(max-width: 640px) 60vw, 320px",
  "data-testid": dataTestId,
}: MuraAnimatedProps) {
  const reduced = useReducedMotionSafe();
  // Safe fallback if a caller bypasses the type system.
  const src = MURA_POSE_ASSETS[pose] ?? MURA_POSE_ASSETS.empty;
  const preset = PRESETS[pose] ?? PRESETS.empty;
  const wrapperClass = ["relative aspect-square", className].filter(Boolean).join(" ");

  const image = (
    <Image
      src={src}
      alt={decorative ? "" : alt}
      aria-hidden={decorative ? true : undefined}
      width={2048}
      height={2048}
      sizes={sizes}
      priority={priority}
      draggable={false}
      className="h-auto w-full select-none"
    />
  );

  // Reduced motion: final state immediately, no movement of any kind.
  if (reduced) {
    return (
      <div className={wrapperClass} data-mura-pose={pose} data-motion="reduced" data-testid={dataTestId}>
        {image}
      </div>
    );
  }

  const trigger = preset.inView
    ? { whileInView: preset.animate, viewport: { once: true, amount: 0.4 } }
    : { animate: preset.animate };

  return (
    <motion.div
      className={wrapperClass}
      data-mura-pose={pose}
      data-motion="full"
      data-testid={dataTestId}
      initial={preset.initial}
      transition={preset.transition}
      whileHover={interactive ? { y: -2, transition: { duration: 0.2, ease: HYDRO } } : undefined}
      {...trigger}
    >
      {image}
    </motion.div>
  );
}
