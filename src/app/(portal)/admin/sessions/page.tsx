import React from "react";
import { redirect } from "next/navigation";
import { getMaintainerClient } from "@/lib/supabase/admin";
import { PortalHeader } from "@/components/ui/section";
import SessionsList from "./sessions-list";
import type { AdminSessionRow } from "./session-form";

export const dynamic = "force-dynamic";

type AttendanceRow = { session_id: string; members: { full_name: string } | { full_name: string }[] | null };

export default async function AdminSessionsPage() {
  const admin = await getMaintainerClient();
  if (!admin) redirect("/dashboard");

  const [sessionsRes, attendanceRes] = await Promise.all([
    admin
      .from("discord_sessions")
      .select("id, title, type, materi, starts_at, ends_at, discord_url, checkin_code")
      .order("starts_at", { ascending: false }),
    admin.from("session_attendance").select("session_id, members(full_name)").order("checked_in_at"),
  ]);

  const attendees = new Map<string, string[]>();
  for (const row of (attendanceRes.data ?? []) as unknown as AttendanceRow[]) {
    const member = Array.isArray(row.members) ? row.members[0] : row.members;
    if (!member?.full_name) continue;
    attendees.set(row.session_id, [...(attendees.get(row.session_id) ?? []), member.full_name]);
  }

  const sessions: AdminSessionRow[] = (sessionsRes.data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    type: row.type,
    materi: row.materi ?? "",
    startsAt: row.starts_at,
    endsAt: row.ends_at,
    discordUrl: row.discord_url,
    code: row.checkin_code,
    attendees: attendees.get(row.id) ?? [],
  }));

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Sesi Discord">
        Atur jadwal sesi mingguan, umumkan kode check-in hanya di voice Discord selama sesi, dan lihat siapa yang hadir. Waktu dalam WIB.
      </PortalHeader>
      <SessionsList sessions={sessions} />
    </div>
  );
}
