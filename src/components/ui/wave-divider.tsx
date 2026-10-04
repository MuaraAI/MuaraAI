import React from "react";

export default function WaveDivider({
  className = "",
  inverted = false,
}: {
  className?: string;
  inverted?: boolean;
}) {
  return (
    <div
      className={`w-full overflow-hidden leading-none pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className={`w-full h-8 sm:h-12 md:h-14 ${inverted ? "rotate-180" : ""}`}
      >
        <path
          d="M0,0 C150,90 400,100 600,40 C800,-20 1050,80 1200,30 L1200,120 L0,120 Z"
          fill="none"
          stroke="#D9E5ED"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
