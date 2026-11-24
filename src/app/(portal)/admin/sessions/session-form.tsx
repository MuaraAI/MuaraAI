"use client";

import React, { useState } from "react";
import { createSession, updateSession } from "@/app/actions/sessions";
import {
  SESSION_TYPES,
  SESSION_TYPE_LABELS,
  isoToWibInput,
  nextFridayDefault,
  wibToIso,
  type SessionType,
} from "@/lib/sessions/sessions";

export interface AdminSessionRow {
  id: string;
  title: string;
  type: string;
  materi: string;
  startsAt: string;
  endsAt: string;
  discordUrl: string;
  code: string;
  attendees: string[];
}

const inputClass = "border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white";
const labelClass = "mb-1.5 block text-sm font-medium text-foreground";

export default function SessionForm({ initial, onDone }: { initial?: AdminSessionRow; onDone: () => void }) {
  const key = initial?.id ?? "new";
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<SessionType>((initial?.type as SessionType) ?? "diskusi");
  const [materi, setMateri] = useState(initial?.materi ?? "");
  const [discordUrl, setDiscordUrl] = useState(initial?.discordUrl ?? "");
  const [start, setStart] = useState(() => (initial ? isoToWibInput(initial.startsAt) : nextFridayDefault(new Date()).start));
  const [end, setEnd] = useState(() => (initial ? isoToWibInput(initial.endsAt) : nextFridayDefault(new Date()).end));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);

    const startsAt = wibToIso(start);
    const endsAt = wibToIso(end);
    if (!startsAt || !endsAt) {
      setSaving(false);
      setError("Jadwal sesi tidak valid.");
      return;
    }

    const payload = { title, type, materi, startsAt, endsAt, discordUrl };
    const result = initial ? await updateSession(initial.id, payload) : await createSession(payload);
    setSaving(false);

    if (result.success) {
      onDone();
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`title-${key}`} className={labelClass}>Judul</label>
          <input id={`title-${key}`} value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`type-${key}`} className={labelClass}>Tipe</label>
          <select id={`type-${key}`} value={type} onChange={(event) => setType(event.target.value as SessionType)} className={inputClass}>
            {SESSION_TYPES.map((value) => (
              <option key={value} value={value}>{SESSION_TYPE_LABELS[value]}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor={`start-${key}`} className={labelClass}>Mulai (WIB)</label>
          <input id={`start-${key}`} type="datetime-local" value={start} onChange={(event) => setStart(event.target.value)} className={inputClass} />
        </div>
        <div>
          <label htmlFor={`end-${key}`} className={labelClass}>Selesai (WIB)</label>
          <input id={`end-${key}`} type="datetime-local" value={end} onChange={(event) => setEnd(event.target.value)} className={inputClass} />
        </div>
      </div>
      <div>
        <label htmlFor={`url-${key}`} className={labelClass}>Link Discord</label>
        <input id={`url-${key}`} value={discordUrl} onChange={(event) => setDiscordUrl(event.target.value)} placeholder="https://discord.gg/..." className={inputClass} />
      </div>
      <div>
        <label htmlFor={`materi-${key}`} className={labelClass}>Materi</label>
        <textarea id={`materi-${key}`} value={materi} onChange={(event) => setMateri(event.target.value)} rows={3} maxLength={2000} className={inputClass} />
      </div>

      {error && <p role="alert" className="text-sm text-rose-800">{error}</p>}
      <button type="submit" disabled={saving} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan sesi"}
      </button>
    </form>
  );
}
