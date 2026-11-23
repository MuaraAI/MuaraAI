"use client";

import React, { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "motion/react";

interface TypeTextProps {
  text: string;
  className?: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Seconds to wait after entering the viewport. */
  delay?: number;
  caret?: boolean;
}

/**
 * Types `text` in once it scrolls into view. The full string is always in the DOM
 * (screen readers, search, tests); the remaining characters reserve their space so nothing shifts.
 */
export default function TypeText({ text, className = "", speed = 38, delay = 0, caret = true }: TypeTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });
  const reducedMotion = useReducedMotion();
  // Start hidden (space reserved) to avoid a flash of the full string before hydration.
  const [count, setCount] = useState(0);
  const [armed, setArmed] = useState(false);
  const [caretVisible, setCaretVisible] = useState(false);

  useEffect(() => {
    if (reducedMotion || typeof IntersectionObserver === "undefined") {
      setCount(text.length);
      return;
    }
    setArmed(true);
  }, [reducedMotion, text]);

  useEffect(() => {
    if (!armed || !inView) return;
    let typed = 0;
    let interval: number | undefined;
    setCaretVisible(true);
    const start = window.setTimeout(() => {
      interval = window.setInterval(() => {
        typed += 1;
        setCount(typed);
        if (typed >= text.length) {
          window.clearInterval(interval);
          window.setTimeout(() => setCaretVisible(false), 1400);
        }
      }, speed);
    }, delay * 1000);
    return () => {
      window.clearTimeout(start);
      if (interval) window.clearInterval(interval);
    };
  }, [armed, inView, text, speed, delay]);

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.slice(0, count)}
        {caret && caretVisible && <span className="type-caret" />}
        <span className="invisible">{text.slice(count)}</span>
      </span>
    </span>
  );
}
