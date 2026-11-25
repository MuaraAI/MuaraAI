import React from "react";

/** Hero title: three plain lines, the last one in the brand color. */
export default function HeroHeadline() {
  return (
    <h1 className="max-w-4xl font-display text-[2.6rem] font-bold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl xl:text-[5.25rem]">
      <span className="block">Belajar,</span>
      <span className="block">membangun,</span>
      <span className="block text-muara-ocean">berkontribusi.</span>
    </h1>
  );
}
