import React from "react";
import { createClient } from "@/lib/supabase/server";
import {
  SESSION_TYPE_LABELS,
  attendanceSummary,
  formatWib,
  isSessionOpen,
  type SessionType,
} from "@/lib/sessions/sessions";
import CheckInForm from "./check-in-form";

const CHECKIN_PREVIEW_MS = 24 * 3_600_000;

interface SessionRow {
  id: string;
  title: string;
  type: string;
  materi: string | null;
  starts_at: string;
  ends_at: string;
  discord_url: string;
}

/** The next Discord session, the check-in form while it is open, and the member's own attendance. */
export default async function SessionsSection({ memberId }: { memberId: string }) {
  const supabase = await createClient();
  const [sessionsRes, attendanceRes] = await Promise.all([
    // The check-in code is deliberately not selected (and not granted to this role).
    supabase
      .from("discord_sessions")
      .select("id, title, type, materi, starts_at, ends_at, discord_url")
      .order("starts_at", { ascending: false })
      .limit(60),
    supabase.from("session_attendance").select("session_id").eq("member_id", memberId),
  ]);

  const now = new Date();
  const rows = (sessionsRes.data ?? []) as SessionRow[];
  const next = rows
    .filter((row) => Date.parse(row.ends_at) >= now.getTime())
    .sort((a, b) => Date.parse(a.starts_at) - Date.parse(b.starts_at))[0];
  const endedIds = rows.filter((row) => Date.parse(row.ends_at) < now.getTime()).map((row) => row.id);
  const attended = new Set((attendanceRes.data ?? []).map((row) => row.session_id as string));
  const summary = attendanceSummary(endedIds, attended);

  return (
    <section className="px-card bg-white p-6 space-y-4">
      <h2 className="font-display text-lg font-bold text-foreground">Sesi Discord</h2>

      {next ? (
        <div className="space-y-3">
          <div>
            <h3 className="font-display text-base font-bold text-foreground">{next.title}</h3>
            <p className="text-xs text-secondary">
              {SESSION_TYPE_LABELS[next.type as SessionType] ?? next.type} · {formatWib(next.starts_at)}
            </p>
          </div>
          {next.materi ? <p className="whitespace-pre-line text-sm text-secondary">{next.materi}</p> : null}
          <a
            href={next.discord_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-btn inline-flex min-h-11 items-center px-5 py-2.5 text-sm font-semibold"
          >
            Buka Discord
          </a>
          {/* Shown from a day ahead so it is already on the page when someone opens the dashboard early;
              the server decides whether the code is valid right now. */}
          {isSessionOpen({ startsAt: next.starts_at, endsAt: next.ends_at }, now) ||
          Date.parse(next.starts_at) - now.getTime() <= CHECKIN_PREVIEW_MS ? (
            <CheckInForm />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-secondary">Belum ada sesi dijadwalkan.</p>
      )}

      {summary.total > 0 ? (
        <div className="border-t border-stroke pt-4 text-sm text-secondary">
          <p>Hadir {summary.attended} dari {summary.total} sesi terakhir</p>
          <p>Streak kehadiran: {summary.streak} sesi</p>
        </div>
      ) : null}
    </section>
  );
}
