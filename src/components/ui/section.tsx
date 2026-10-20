import React from "react";
import Link from "next/link";
import FadeIn from "./fade-in";
import TypeText from "./type-text";

const TONES = {
  white: "bg-white",
  tint: "bg-surface-alt/60",
  plain: "bg-background",
} as const;

/** Shared section shell: one content width (aligned with the navbar and hero) and alternating tones. */
export function Section({
  id,
  tone = "white",
  className = "",
  children,
}: {
  id?: string;
  tone?: keyof typeof TONES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={`overflow-x-clip border-b border-stroke px-4 py-20 sm:px-6 md:py-24 lg:px-8 ${TONES[tone]} ${className}`}>
      <div className="mx-auto max-w-[100rem]">{children}</div>
    </section>
  );
}

/**
 * Section heading: eyebrow types itself in, the title rises, the description drifts in from the right.
 * `split` puts title and description side by side on desktop; `center` stacks them.
 */
export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "split",
  className = "",
}: {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "split" | "center";
  className?: string;
}) {
  const centered = align === "center";
  return (
    <div
      className={`mb-12 md:mb-14 ${
        centered ? "mx-auto max-w-3xl text-center" : "flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"
      } ${className}`}
    >
      <div className={centered ? "" : "max-w-2xl"}>
        <p className={`mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muara-ocean ${centered ? "justify-center" : ""}`}>
          <span className="h-1.5 w-1.5 shrink-0 bg-muara-ocean" aria-hidden="true" />
          <TypeText text={eyebrow} speed={28} />
        </p>
        <FadeIn delay={0.1} distance={18}>
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {title}
          </h2>
        </FadeIn>
      </div>
      {description && (
        <FadeIn delay={0.2} direction={centered ? "up" : "right"} distance={centered ? 14 : 24}>
          <p className={`text-sm leading-relaxed text-secondary sm:text-[15px] ${centered ? "mx-auto mt-4 max-w-xl" : "max-w-xl lg:max-w-md lg:text-right"}`}>
            {description}
          </p>
        </FadeIn>
      )}
    </div>
  );
}

/** Header for inner pages (members, legal): breadcrumb back home, typed eyebrow, rising title. */
export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-6 border-b-2 border-dashed border-[#CFE2EE] pb-8 md:flex-row md:items-end md:justify-between">
      <div className="max-w-3xl">
        <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.18em] text-muara-ocean">
          <Link href="/" className="group inline-flex items-center gap-1.5 transition-colors hover:text-foreground">
            <span className="inline-block transition-transform duration-200 group-hover:-translate-x-0.5" aria-hidden="true">←</span>
            Beranda
          </Link>
          <span className="text-[#9CC6E0]" aria-hidden="true">/</span>
          <TypeText text={eyebrow} speed={28} />
        </nav>
        <FadeIn distance={18}>
          <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{title}</h1>
        </FadeIn>
        {description && (
          <FadeIn delay={0.12} distance={14}>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-secondary sm:text-[15px]">{description}</p>
          </FadeIn>
        )}
      </div>
      {actions && (
        <FadeIn direction="right" delay={0.2} className="shrink-0">
          {actions}
        </FadeIn>
      )}
    </div>
  );
}

/** Header for portal pages (member + maintainer workspaces). */
export function PortalHeader({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="border-b-2 border-dashed border-[#CFE2EE] pb-6">
      <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-muara-ocean">
        <span className="h-1.5 w-1.5 bg-muara-ocean" aria-hidden="true" />
        <TypeText text={eyebrow} speed={26} />
      </p>
      <FadeIn distance={14}>
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">{title}</h1>
      </FadeIn>
      {children && (
        <FadeIn delay={0.08} distance={10}>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-secondary">{children}</p>
        </FadeIn>
      )}
    </div>
  );
}
