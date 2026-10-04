"use client";

import React from "react";
import { motion } from "motion/react";

export default function FlowingBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Current Blob 1 (Top Left) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -30, 20, 0],
          scale: [1, 1.08, 0.95, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-sky-200/35 via-cyan-100/20 to-transparent blur-3xl opacity-70"
      />

      {/* Current Blob 2 (Mid Right) */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 0.94, 1.06, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/3 -right-40 w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-teal-100/30 via-sky-100/20 to-transparent blur-3xl opacity-60"
      />

      {/* Current Blob 3 (Bottom Left) */}
      <motion.div
        animate={{
          x: [0, 35, -40, 0],
          y: [0, -25, 35, 0],
          scale: [1, 1.05, 0.96, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute -bottom-40 left-1/4 w-[700px] h-[550px] rounded-full bg-gradient-to-tr from-sky-100/30 via-teal-50/20 to-transparent blur-3xl opacity-50"
      />
    </div>
  );
}
