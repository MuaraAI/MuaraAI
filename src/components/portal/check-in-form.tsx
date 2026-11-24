"use client";

import React, { useState } from "react";
import { checkInToSession } from "@/app/actions/sessions";

type Message = { tone: "success" | "error"; text: string };

export default function CheckInForm() {
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
        setMessage({ tone: "success", text: `Berhasil check-in: ${result.title ?? "sesi"}` });
      } else {
        setMessage({ tone: "error", text: result.error ?? "Check-in gagal." });
      }
    } catch {
      setMessage({ tone: "error", text: "Check-in gagal. Coba lagi." });
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="checkin-code" className="block text-sm font-medium text-foreground">Kode check-in</label>
      <div className="flex flex-wrap gap-2">
        <input
          id="checkin-code"
          value={code}
          onChange={(event) => setCode(event.target.value)}
          autoComplete="off"
          autoCapitalize="characters"
          maxLength={12}
          placeholder="Kode dari voice Discord"
          className="border-2 border-[#CFE2EE] min-w-0 flex-1 bg-surface-alt px-3.5 py-2.5 font-mono text-sm uppercase text-foreground focus:bg-white"
        />
        <button type="submit" disabled={sending} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
          {sending ? "Memeriksa..." : "Check-in"}
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
