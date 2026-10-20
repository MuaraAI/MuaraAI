import React from "react";
import Image from "next/image";
import TypeText from "./type-text";

/**
 * Shared layout for 404 / error pages: Mura (transparent cut-out, no card) sits beside the copy and points
 * at it on every screen size. Phones: [mascot | copy] then a full-width actions row. sm+: the mascot spans
 * both rows on the left, copy and actions stack on the right.
 */
export default function StatusScene({
  code,
  eyebrow,
  title,
  description,
  mascotSrc,
  mascotAlt,
  mascotTestId,
  actions,
  footer,
  tone = "ocean",
}: {
  code: string;
  eyebrow: string;
  title: string;
  description: string;
  mascotSrc: string;
  mascotAlt: string;
  mascotTestId?: string;
  actions: React.ReactNode;
  footer?: React.ReactNode;
  tone?: "ocean" | "rose";
}) {
  const accent = tone === "rose" ? "#E11D48" : "#0369A1";
  return (
    <section className="relative w-full overflow-x-clip px-4 py-10 sm:px-6 md:py-16 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-[36%_1fr] items-center gap-x-4 gap-y-8 sm:grid-cols-[0.8fr_1.2fr] sm:gap-x-10 sm:gap-y-0 lg:grid-cols-[0.9fr_1.1fr] lg:gap-x-14">
        {/* Mascot */}
        <div className="relative mx-auto w-full max-w-[19rem] sm:row-span-2">
          <div
            aria-hidden="true"
            className="absolute inset-x-[8%] top-[12%] bottom-[10%] -z-10 rounded-full bg-[radial-gradient(closest-side,rgba(3,105,161,0.12),transparent)]"
          />
          <Image
            src={mascotSrc}
            alt={mascotAlt}
            width={596}
            height={900}
            priority
            data-testid={mascotTestId}
            className="h-auto w-full select-none drop-shadow-[0_18px_24px_rgba(7,32,51,0.12)]"
          />
          {/* Pixel shadow under her feet */}
          <div aria-hidden="true" className="ml-[8%] mt-1 flex w-[55%] flex-col items-center gap-[3px] opacity-60">
            <span className="h-[3px] w-1/2 bg-[#B9D3E4] sm:h-[4px]" />
            <span className="h-[3px] w-full bg-[#CFE2EE] sm:h-[4px]" />
          </div>
        </div>

        {/* Copy */}
        <div className="stagger-rise sm:self-end">
          <p
            className="mb-3 flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.18em] sm:mb-4 sm:text-[11px] sm:tracking-[0.2em]"
            style={{ color: accent }}
          >
            <span className="h-1.5 w-1.5 shrink-0" style={{ background: accent }} aria-hidden="true" />
            <TypeText text={eyebrow} speed={30} />
          </p>
          <p
            className="font-mono text-[3.25rem] font-bold leading-none tracking-tight text-foreground sm:text-[6rem] lg:text-[7rem]"
            style={{ textShadow: `4px 4px 0 ${accent}, 8px 8px 0 #CFE2EE` }}
            aria-hidden="true"
          >
            {code}
          </p>
          <h1 className="mt-5 max-w-xl font-display text-xl font-bold leading-snug tracking-tight text-foreground sm:mt-8 sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-secondary sm:mt-3 sm:text-[15px]">{description}</p>
        </div>

        {/* Actions: full width under both columns on phones, under the copy from sm up */}
        <div className="stagger-rise col-span-2 sm:col-span-1 sm:col-start-2 sm:self-start">
          <div className="grid gap-3 sm:mt-8 sm:flex sm:gap-4">{actions}</div>
          {footer && <div className="mt-8 sm:mt-10">{footer}</div>}
        </div>
      </div>
    </section>
  );
}
