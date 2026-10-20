"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Icon from "./icon";

type Tone = "default" | "danger" | "success";

export interface ConfirmOptions {
  title: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: Tone;
}

export interface PromptOptions extends ConfirmOptions {
  /** Label shown above the text field. */
  label: string;
  defaultValue?: string;
  placeholder?: string;
}

export interface NotifyOptions {
  title: string;
  message?: string;
  tone?: "success" | "error" | "info";
}

interface FeedbackApi {
  /** Pixel-styled replacement for window.confirm(). Resolves true when confirmed. */
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  /** Pixel-styled replacement for window.prompt(). Resolves the text, or null when cancelled. */
  prompt: (options: PromptOptions) => Promise<string | null>;
  /** Pixel-styled toast, replacing window.alert(). */
  notify: (options: NotifyOptions) => void;
}

// Without a provider (e.g. isolated component tests) fall back to quiet, safe defaults.
const FeedbackContext = createContext<FeedbackApi>({
  confirm: async () => false,
  prompt: async () => null,
  notify: () => {},
});

export const useFeedback = () => useContext(FeedbackContext);

type Toast = NotifyOptions & { id: number; leaving?: boolean };

const TOAST_STYLE: Record<NonNullable<NotifyOptions["tone"]>, { line: string; bg: string; icon: string; color: string }> = {
  success: { line: "#0F766E", bg: "#F0FDFA", icon: "check_circle", color: "#0F766E" },
  error: { line: "#BE123C", bg: "#FFF1F2", icon: "error", color: "#BE123C" },
  info: { line: "#0369A1", bg: "#F0F7FB", icon: "info", color: "#0369A1" },
};

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<(Partial<PromptOptions> & ConfirmOptions & { resolve: (result: string | null) => void; withInput: boolean }) | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [toasts, setToasts] = useState<Toast[]>([]);
  const confirmButton = useRef<HTMLButtonElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    return new Promise<boolean>((resolve) => setDialog({ ...options, withInput: false, resolve: (result) => resolve(result !== null) }));
  }, []);

  const prompt = useCallback((options: PromptOptions) => {
    lastFocus.current = document.activeElement as HTMLElement | null;
    setInputValue(options.defaultValue ?? "");
    return new Promise<string | null>((resolve) => setDialog({ ...options, withInput: true, resolve }));
  }, []);

  const close = useCallback(
    (ok: boolean) => {
      dialog?.resolve(ok ? (dialog.withInput ? inputValue.trim() : "") : null);
      setDialog(null);
      lastFocus.current?.focus?.();
    },
    [dialog, inputValue],
  );

  const notify = useCallback((options: NotifyOptions) => {
    const id = Date.now() + Math.random();
    setToasts((list) => [...list.slice(-2), { tone: "info", ...options, id }]);
    window.setTimeout(() => setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t))), 4200);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 4600);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    if (dialog.withInput) inputRef.current?.select();
    else confirmButton.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dialog, close]);

  const danger = dialog?.tone === "danger";

  return (
    <FeedbackContext.Provider value={{ confirm, prompt, notify }}>
      {children}

      {dialog && (
        <div
          className="modal-backdrop fixed inset-0 z-[90] flex items-center justify-center bg-[#072033]/55 p-4 backdrop-blur-sm"
          onPointerDown={(event) => event.target === event.currentTarget && close(false)}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="feedback-title"
            aria-describedby={dialog.message ? "feedback-message" : undefined}
            className="modal-panel px-card w-full max-w-md bg-white p-6 [--px-drop:#0369A1] sm:p-7"
          >
            <div className="flex items-start gap-4">
              <span
                className={`px-icon h-11 w-11 shrink-0 ${danger ? "bg-rose-50 text-rose-700 [--px-line:#FDA4AF]" : ""}`}
                aria-hidden="true"
              >
                <Icon name={danger ? "warning" : "info"} className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h2 id="feedback-title" className="font-display text-lg font-bold text-foreground">
                  {dialog.title}
                </h2>
                {dialog.message && (
                  <div id="feedback-message" className="mt-1.5 text-sm leading-relaxed text-secondary">
                    {dialog.message}
                  </div>
                )}
              </div>
            </div>
            {dialog.withInput && (
              <div className="mt-5">
                <label htmlFor="feedback-input" className="mb-1.5 block text-xs font-semibold text-foreground">
                  {dialog.label}
                </label>
                <textarea
                  id="feedback-input"
                  ref={inputRef}
                  rows={3}
                  value={inputValue}
                  placeholder={dialog.placeholder}
                  onChange={(event) => setInputValue(event.target.value)}
                  className="w-full border-2 border-[#CFE2EE] bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>
            )}
            <div className="mt-6 flex flex-col-reverse gap-3 border-t-2 border-dashed border-[#CFE2EE] pt-5 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => close(false)} className="px-btn-ghost px-4 py-2.5 text-sm font-semibold [--px-off:3px]">
                {dialog.cancelLabel ?? "Batal"}
              </button>
              <button
                ref={confirmButton}
                type="button"
                onClick={() => close(true)}
                disabled={dialog.withInput && !inputValue.trim()}
                className={`${danger ? "px-btn-danger" : "px-btn"} px-5 py-2.5 text-sm font-bold`}
              >
                {dialog.confirmLabel ?? "Ya, lanjutkan"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pointer-events-none fixed inset-x-4 bottom-4 z-[95] flex flex-col items-end gap-3 sm:inset-x-auto sm:right-6 sm:w-96">
        {toasts.map((toast) => {
          const style = TOAST_STYLE[toast.tone ?? "info"];
          return (
            <div
              key={toast.id}
              role={toast.tone === "error" ? "alert" : "status"}
              data-leaving={toast.leaving ? "true" : undefined}
              className="toast-pop px-frame pointer-events-auto flex w-full items-start gap-3 p-4"
              style={{ background: style.bg, ["--px-line" as string]: style.line }}
            >
              <span style={{ color: style.color }} className="mt-0.5 shrink-0">
                <Icon name={style.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-sm font-bold text-foreground">{toast.title}</p>
                {toast.message && <p className="mt-0.5 break-words text-xs leading-relaxed text-secondary">{toast.message}</p>}
              </div>
              <button
                type="button"
                aria-label="Tutup notifikasi"
                onClick={() => setToasts((list) => list.filter((t) => t.id !== toast.id))}
                className="-m-1 p-1 text-secondary transition-colors hover:text-foreground"
              >
                <Icon name="close" className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </FeedbackContext.Provider>
  );
}
