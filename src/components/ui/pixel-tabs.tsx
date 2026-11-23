"use client";

import React, { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import Icon, { type IconName } from "./icon";

export type TabItem<T extends string = string> = { id: T; label: string; icon?: IconName; badge?: number };

const SPRING = { type: "spring" as const, stiffness: 420, damping: 38 };
// useLayoutEffect warns during SSR; fall back to useEffect there.
const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Segmented tabs: one dark indicator glides to the active tab, a light highlight follows the pointer.
 * Scrolls sideways on narrow screens. Keyboard: ←/→, Home/End.
 */
export function PixelTabs<T extends string>({
  tabs,
  value,
  onChange,
  ariaLabel,
  idPrefix,
  className = "",
}: {
  tabs: readonly TabItem<T>[];
  value: T;
  onChange: (id: T) => void;
  ariaLabel: string;
  /** Lets a TabSlide panel reference its tab via aria-labelledby. */
  idPrefix?: string;
  className?: string;
}) {
  const autoId = useId();
  const prefix = idPrefix ?? `tabs-${autoId}`;
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [active, setActive] = useState<{ x: number; w: number } | null>(null);
  const [hover, setHover] = useState<{ x: number; w: number } | null>(null);

  const measure = (id: string | null) => {
    const el = id ? refs.current[id] : null;
    return el ? { x: el.offsetLeft, w: el.offsetWidth } : null;
  };

  useIsoLayoutEffect(() => {
    const update = () => setActive(measure(value));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [value, tabs]);

  // Keep the active tab in view when the strip scrolls sideways on phones (never scrolls the page itself).
  useEffect(() => {
    const el = refs.current[value];
    const strip = el?.parentElement;
    if (!el || !strip) return;
    const left = el.offsetLeft - 8;
    const right = el.offsetLeft + el.offsetWidth + 8 - strip.clientWidth;
    if (strip.scrollLeft > left) strip.scrollTo?.({ left, behavior: "smooth" });
    else if (strip.scrollLeft < right) strip.scrollTo?.({ left: right, behavior: "smooth" });
  }, [value]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const index = tabs.findIndex((t) => t.id === value);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (index - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    onChange(tabs[next].id);
    refs.current[tabs[next].id]?.focus();
  };

  return (
    <div className={`p-[2px] ${className}`}>
      <div
        role="tablist"
        aria-label={ariaLabel}
        onKeyDown={onKeyDown}
        onMouseLeave={() => setHover(null)}
        className="px-frame scroll-slim relative flex w-full max-w-full gap-1 overflow-x-auto bg-white p-1 [--px-line:#CFE2EE] sm:w-fit"
      >
        {hover && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 bg-[#E1EEF7]"
            initial={false}
            animate={{ x: hover.x, width: hover.w }}
            transition={SPRING}
          />
        )}
        {active && (
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-1 left-0 bg-foreground shadow-[3px_3px_0_0_#0369A1]"
            initial={false}
            animate={{ x: active.x, width: active.w }}
            transition={SPRING}
          />
        )}
        {tabs.map((tab) => {
          const selected = tab.id === value;
          return (
            <button
              key={tab.id}
              ref={(el) => {
                refs.current[tab.id] = el;
              }}
              id={`${prefix}-tab-${tab.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${prefix}-panel`}
              aria-pressed={selected}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onMouseEnter={() => setHover(measure(tab.id))}
              className={`relative z-10 inline-flex min-h-10 shrink-0 items-center gap-2 whitespace-nowrap px-3.5 font-mono text-xs font-semibold transition-colors duration-300 ${
                selected ? "text-white" : "text-secondary hover:text-foreground"
              }`}
            >
              {tab.icon && <Icon name={tab.icon} className="h-4 w-4" />}
              {tab.label}
              {typeof tab.badge === "number" && tab.badge > 0 && (
                <span className={`px-1.5 py-px text-[10px] font-bold ${selected ? "bg-[#FCD34D] text-foreground" : "bg-amber-100 text-amber-800"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Panel that slides in from the side of the newly chosen tab (right when moving right, left when moving left).
 * Pass the tab order so direction can be worked out.
 */
export function TabSlide<T extends string>({
  value,
  order,
  idPrefix,
  className = "",
  children,
}: {
  value: T;
  order: readonly T[];
  idPrefix?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const reducedMotion = useReducedMotion();
  const previous = useRef(value);
  const direction = useRef(0);
  if (previous.current !== value) {
    direction.current = Math.sign(order.indexOf(value) - order.indexOf(previous.current));
    previous.current = value;
  }
  return (
    <motion.div
      key={value}
      role="tabpanel"
      id={idPrefix ? `${idPrefix}-panel` : undefined}
      aria-labelledby={idPrefix ? `${idPrefix}-tab-${value}` : undefined}
      initial={reducedMotion || direction.current === 0 ? false : { opacity: 0, x: direction.current * 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
