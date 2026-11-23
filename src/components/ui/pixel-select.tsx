"use client";

import React, { useEffect, useId, useRef, useState } from "react";

export type SelectOption = { value: string; label: string; hint?: string };

interface PixelSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: readonly SelectOption[];
  /** Matches a <label htmlFor> so clicking the label opens/focuses the control. */
  id?: string;
  name?: string;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
}

/**
 * Custom dropdown (replaces the native <select>): pixel-framed trigger + listbox popover.
 * Keyboard: ↑/↓, Home/End, Enter/Space, Escape, Tab, and type-ahead by first letter.
 */
export default function PixelSelect({ value, onChange, options, id, name, placeholder = "Pilih…", className = "", ...aria }: PixelSelectProps) {
  const autoId = useId();
  const buttonId = id ?? `select-${autoId}`;
  const listId = `${buttonId}-list`;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(() => Math.max(0, options.findIndex((o) => o.value === value)));
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    listRef.current?.focus();
    return () => document.removeEventListener("pointerdown", onPointer);
  }, [open]);

  // Keep the highlighted option visible while moving with the keyboard.
  useEffect(() => {
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    if (!open || !list || !item) return;
    if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
    else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight) list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
  }, [active, open]);

  const openList = () => {
    setActive(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const choose = (index: number) => {
    const option = options[index];
    if (option) onChange(option.value);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onButtonKey = (event: React.KeyboardEvent) => {
    if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
      event.preventDefault();
      openList();
    }
  };

  const onListKey = (event: React.KeyboardEvent) => {
    const last = options.length - 1;
    if (event.key === "ArrowDown") setActive((i) => Math.min(last, i + 1));
    else if (event.key === "ArrowUp") setActive((i) => Math.max(0, i - 1));
    else if (event.key === "Home") setActive(0);
    else if (event.key === "End") setActive(last);
    else if (event.key === "Enter" || event.key === " ") choose(active);
    else if (event.key === "Escape") {
      setOpen(false);
      buttonRef.current?.focus();
    } else if (event.key === "Tab") setOpen(false);
    else if (event.key.length === 1) {
      const key = event.key.toLowerCase();
      const start = (active + 1) % options.length;
      const order = [...options.slice(start), ...options.slice(0, start)];
      const hit = order.find((o) => o.label.toLowerCase().startsWith(key));
      if (hit) setActive(options.indexOf(hit));
      return;
    } else return;
    event.preventDefault();
  };

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={buttonRef}
        id={buttonId}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={aria["aria-label"]}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onButtonKey}
        className={`flex w-full items-center justify-between gap-3 border-2 bg-white px-3.5 py-2.5 text-left text-sm text-foreground transition-colors duration-200 ${
          open ? "border-muara-ocean" : "border-[#CFE2EE] hover:border-[#9CC6E0]"
        }`}
      >
        <span className={selected ? "" : "text-secondary"}>{selected?.label ?? placeholder}</span>
        {/* Pixel chevron */}
        <svg
          viewBox="0 0 10 6"
          shapeRendering="crispEdges"
          className={`h-1.5 w-2.5 shrink-0 text-muara-ocean transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path fill="currentColor" d="M0 0h2v2H0zM2 2h2v2H2zM4 4h2v2H4zM6 2h2v2H6zM8 0h2v2H8z" />
        </svg>
      </button>

      <ul
        ref={listRef}
        id={listId}
        role="listbox"
        tabIndex={-1}
        aria-labelledby={buttonId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onKeyDown={onListKey}
        data-open={open}
        className="pixel-select-list px-frame absolute inset-x-0 top-[calc(100%+8px)] z-40 max-h-64 overflow-y-auto bg-white p-1 outline-none [--px-drop:#CFE2EE] [--px-off:4px]"
      >
        {options.map((option, index) => {
          const isSelected = option.value === value;
          const isActive = index === active;
          return (
            <li
              key={option.value}
              id={`${listId}-${index}`}
              data-index={index}
              role="option"
              aria-selected={isSelected}
              onPointerEnter={() => setActive(index)}
              onClick={() => choose(index)}
              className={`flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm transition-colors duration-100 ${
                isActive ? "bg-[#E1EEF7] text-foreground" : "text-secondary"
              }`}
            >
              <span
                aria-hidden="true"
                className={`h-2 w-2 shrink-0 ${isSelected ? "bg-muara-ocean shadow-[2px_2px_0_0_#163A55]" : "bg-transparent"}`}
              />
              <span className={isSelected ? "font-semibold text-foreground" : ""}>{option.label}</span>
              {option.hint && <span className="ml-auto font-mono text-[10px] text-secondary">{option.hint}</span>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
