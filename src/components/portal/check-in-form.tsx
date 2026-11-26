"use client";

import React, { useState } from "react";
import { checkInToSession } from "@/app/actions/sessions";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { PORTAL_COPY } from "@/lib/portal-copy";

type Message = { tone: "success" | "error"; text: string };

export default function CheckInForm({ locale = "id" }: { locale?: Locale }) {
  const t = PORTAL_COPY[normalizeLocale(locale)].checkIn;
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!code.trim()) return;

    setSending(true);
    setMessage(null);
    try {
      const result = await checkInToSession(code);
      if (result.success) {
        setCode("");
        setMessage({ tone: "success", text: t.success(result.title ?? t.defaultTitle) });
      } else {
        setMessage({ tone: "error", text: result.error ?? t.failed });
      }
    } catch {
      setMessage({ tone: "error", text: t.failedRetry });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="checkin-code" className="block text-sm font-medium text-foreground">{t.label}</label>
      <div className="flex flex-wrap gap-2">
        <input
          id="checkin-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={12}
          placeholder={t.placeholder}
          className="border-2 border-[#CFE2EE] min-w-0 flex-1 bg-surface-alt px-3.5 py-2.5 font-mono text-sm uppercase text-foreground focus:bg-white"
        />
        <button type="submit" disabled={sending} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {sending ? t.sending : t.submit}
        </button>
      </div>
      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={message.tone === "error" ? "text-sm text-rose-800" : "text-sm text-emerald-800"}>
          {message.text}
        </p>
      )}
    </form>
  );
}
