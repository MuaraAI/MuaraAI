"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSession, regenerateCheckinCode } from "@/app/actions/sessions";
import { SESSION_TYPE_LABELS, formatWib, isoToWibInput, type SessionType } from "@/lib/sessions/sessions";
import SessionForm, { type AdminSessionRow } from "./session-form";

export type { AdminSessionRow };

export default function SessionsList({ sessions }: { sessions: AdminSessionRow[] }) {
  const router = useRouter();
  const [codes, setCodes] = useState<Record<string, string>>({});
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refreshed = () => {
    setEditing(null);
    router.refresh();
  };

  const regenerate = async (id: string) => {
    setError(null);
    const result = await regenerateCheckinCode(id);
    if (result.success) setCodes((current) => ({ ...current, [id]: result.code }));
    else setError(result.error);
  };

  const remove = async (id: string) => {
    if (!window.confirm("Hapus sesi ini beserta data kehadirannya?")) return;
    setError(null);
    const result = await deleteSession(id);
    if (result.success) router.refresh();
    else setError(result.error);
  };

  return (
    <div className="space-y-8">
      <section className="px-card bg-white p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">Sesi baru</h2>
        <SessionForm onDone={refreshed} />
      </section>

      {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}

      {sessions.length === 0 ? (
        <p className="text-sm text-secondary">Belum ada sesi.</p>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session) => (
            <li key={session.id} className="px-card bg-white p-6 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-display text-base font-bold text-foreground">{session.title}</h3>
                  <p className="text-xs text-secondary">
                    {SESSION_TYPE_LABELS[session.type as SessionType] ?? session.type} · {formatWib(session.startsAt)} · selesai{" "}
                    {isoToWibInput(session.endsAt).slice(11).replace(":", ".")} WIB
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-mono uppercase text-secondary">Kode check-in</div>
                  <strong className="font-mono text-xl tracking-widest text-foreground">{codes[session.id] ?? session.code}</strong>
                </div>
              </div>

              <p className="text-sm text-secondary">
                {session.attendees.length} hadir{session.attendees.length > 0 ? `: ${session.attendees.join(", ")}` : ""}
              </p>

              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => regenerate(session.id)} className="px-btn min-h-11 px-4 py-2 text-xs font-semibold">
                  Buat ulang kode
                </button>
                <button type="button" onClick={() => setEditing(editing === session.id ? null : session.id)} className="px-btn min-h-11 px-4 py-2 text-xs font-semibold">
                  {editing === session.id ? "Tutup" : "Ubah"}
                </button>
                <button type="button" onClick={() => remove(session.id)} className="px-btn min-h-11 px-4 py-2 text-xs font-semibold text-rose-800">
                  Hapus
                </button>
              </div>

              {editing === session.id && <SessionForm initial={session} onDone={refreshed} />}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
