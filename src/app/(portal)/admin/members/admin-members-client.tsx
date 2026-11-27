"use client";

import React, { useState } from "react";
import { Member } from "@/types/database";
import { toggleMemberActive, syncOrgCommits, setMemberRole } from "@/app/actions/admin";
import type { PositionsConfig } from "@/lib/positions";
import { RANKS, roleLabel, type Division, type Rank, type RoleChange } from "@/lib/structure";
import Icon from "@/components/ui/icon";
import { useFeedback } from "@/components/ui/feedback";

interface AdminMembersClientProps {
  initialMembers: Member[];
  positions: PositionsConfig | null;
}

const SELECT_CLASS = "min-h-9 border-2 border-[#CFE2EE] bg-surface-alt px-2 py-1 text-[11px] text-foreground focus:border-muara-ocean";
const RANK_NAMES: Record<Rank, string> = { maintainer: "Maintainer", head: "Head", lead: "Lead", member: "Member" };

/** Rank, division and position of one person, saved together. */
function RoleCell({ member, positions, busy, onSave }: { member: Member; positions: PositionsConfig; busy: boolean; onSave: (change: RoleChange) => void }) {
  const [rank, setRank] = useState<Rank>(member.hierarchy);
  const [division, setDivision] = useState<Division>(member.division);
  const [track, setTrack] = useState(member.track ?? "");
  const dirty = rank !== member.hierarchy || division !== member.division || track !== (member.track ?? "");

  return (
    <div className="space-y-1.5">
      <div className="font-bold text-foreground">{roleLabel(member)}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        <select aria-label={`Peringkat ${member.full_name}`} value={rank} onChange={(e) => setRank(e.target.value as Rank)} className={SELECT_CLASS}>
          {RANKS.map((value) => <option key={value} value={value}>{RANK_NAMES[value]}</option>)}
        </select>
        <select aria-label={`Divisi ${member.full_name}`} value={division} onChange={(e) => { setDivision(e.target.value as Division); setTrack(""); }} className={SELECT_CLASS}>
          <option value="builder">Builder</option>
          <option value="creative">Creative</option>
        </select>
        <select aria-label={`Posisi ${member.full_name}`} value={track} onChange={(e) => setTrack(e.target.value)} className={SELECT_CLASS}>
          <option value="">Tanpa posisi</option>
          {positions[division].map((value) => <option key={value} value={value}>{value}</option>)}
        </select>
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() => onSave({ hierarchy: rank, division, track: track || null })}
          className="px-chip border border-muara-ocean px-3 py-1 text-[11px] font-bold text-muara-ocean disabled:opacity-40"
        >
          Simpan peran
        </button>
      </div>
    </div>
  );
}

export default function AdminMembersClient({ initialMembers, positions }: AdminMembersClientProps) {
  const { confirm, notify } = useFeedback();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [syncingCommits, setSyncingCommits] = useState(false);

  const handleSyncCommits = async () => {
    setSyncingCommits(true);
    const res = await syncOrgCommits();
    setSyncingCommits(false);

    if (res.success && res.updated) {
      const commitMap = new Map(res.updated.map((u) => [u.id, u.commits]));
      setMembers((prev) =>
        prev.map((m) => (commitMap.has(m.id) ? { ...m, total_commits: commitMap.get(m.id)! } : m))
      );
      notify({ tone: "success", title: "Commit tersinkron", message: `${res.count} anggota diperbarui dari org MuaraAI.` });
    } else {
      notify({ tone: "error", title: "Gagal sinkron commit", message: String(res.error || "Terjadi kesalahan.") });
    }
  };

  const handleToggleActive = async (member: Member) => {
    if (member.membership_status === "exited" || member.reapply_blocked) return;

    const nextState = !member.is_active;
    const ok = await confirm(
      nextState
        ? { title: "Aktifkan kembali akses?", message: `Member @${member.github_username} akan bisa mengakses portal lagi.`, confirmLabel: "Aktifkan" }
        : { title: "Nonaktifkan akses member ini?", message: `Akses @${member.github_username} ke portal dan repositori akan dinonaktifkan.`, confirmLabel: "Nonaktifkan", tone: "danger" },
    );
    if (!ok) return;

    setProcessingId(member.id);
    const res = await toggleMemberActive(member.id, nextState);
    setProcessingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: nextState } : m))
      );
      notify({ tone: "success", title: nextState ? "Akses diaktifkan kembali" : "Akses member dinonaktifkan", message: `@${member.github_username}` });
    } else {
      notify({ tone: "error", title: "Gagal update status", message: String(res.error ?? "Terjadi kesalahan.") });
    }
  };

  const handleSaveRole = async (member: Member, change: RoleChange) => {
    const touchesAccess = change.hierarchy === "maintainer" || member.hierarchy === "maintainer";
    const ok = await confirm({
      title: touchesAccess ? "Ubah akses maintainer?" : "Simpan peran baru?",
      message: touchesAccess
        ? `Maintainer punya akses penuh ke admin. @${member.github_username} akan menjadi ${roleLabel(change)}.`
        : `@${member.github_username} akan menjadi ${roleLabel(change)}.`,
      confirmLabel: "Simpan",
    });
    if (!ok) return;

    setProcessingId(member.id);
    const res = await setMemberRole(member.id, change);
    setProcessingId(null);

    if (res.success) {
      setMembers((prev) => prev.map((m) => (m.id === member.id ? { ...m, hierarchy: change.hierarchy, division: change.division, track: change.track } : m)));
      notify({ tone: "success", title: "Peran disimpan", message: `@${member.github_username}: ${roleLabel(change)}` });
    } else {
      notify({ tone: "error", title: "Gagal menyimpan peran", message: String(res.error ?? "Terjadi kesalahan.") });
    }
  };

  return (
    <div className="px-card bg-white p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="font-display font-bold text-base text-foreground">
            Daftar Seluruh Anggota ({members.length})
          </div>
          <button
            type="button"
            disabled={syncingCommits}
            onClick={handleSyncCommits}
            className="px-btn-ghost [--px-off:3px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50 transition-colors"
          >
            <Icon name="sync" className={`w-3.5 h-3.5 text-muara-ocean ${syncingCommits ? "animate-spin" : ""}`} />
            <span>{syncingCommits ? "Menyinkronkan..." : "Sinkronkan Commit GitHub"}</span>
          </button>
        </div>
      </div>

      <div className="scroll-slim overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-stroke text-secondary uppercase">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Peran</th>
              <th className="py-2.5 px-3">Lifecycle</th>
              <th className="py-2.5 px-3 text-center">Commits</th>
              <th className="py-2.5 px-3">Intake</th>
              <th className="py-2.5 px-3">Mulai Membership</th>
              <th className="py-2.5 px-3 text-center">Status Akses</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke text-slate-700">
            {members.map((m) => {
              const exited = m.membership_status === "exited" || m.reapply_blocked;
              return (
                <tr key={m.id} className="hover:bg-surface-alt/60">
                  <td className="py-3 px-3">
                    <div className="font-bold text-foreground">{m.full_name}</div>
                    <div className="text-[10px] text-secondary">@{m.github_username}</div>
                  </td>
                  <td className="py-3 px-3">
                    {positions ? (
                      <RoleCell key={`${m.id}-${m.hierarchy}-${m.division}-${m.track}`} member={m} positions={positions} busy={processingId === m.id} onSave={(change) => handleSaveRole(m, change)} />
                    ) : (
                      <span className="font-bold text-foreground">{roleLabel(m)}</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-chip inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                      exited ? "bg-slate-100 text-slate-700 border border-stroke" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}>
                      {m.membership_status === "exited" ? "Exited" : m.membership_status === "banned" ? "Banned" : "Active"}
                    </span>
                    {exited && (
                      <div className="mt-1 text-[10px] text-rose-700 font-semibold">Tidak dapat daftar ulang</div>
                    )}
                    {m.exited_at && (
                      <div className="mt-1 text-[10px] text-secondary">Keluar: {new Date(m.exited_at).toLocaleDateString("id-ID")}</div>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center font-bold text-foreground">
                    {m.total_commits || 0}
                  </td>
                  <td className="py-3 px-3 text-[10px] text-secondary">
                    {m.intake_policy_version || "Grandfathered"}
                  </td>
                  <td className="py-3 px-3 text-[10px] text-secondary">
                    {m.membership_started_at
                      ? new Date(m.membership_started_at).toLocaleDateString("id-ID")
                      : "Historis / belum dicatat"}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-chip inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.is_active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}>
                      {m.is_active ? "Aktif" : "Nonaktif"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {exited ? (
                      <span className="text-[10px] text-secondary">Lifecycle terkunci</span>
                    ) : (
                      <button
                        disabled={processingId === m.id}
                        onClick={() => handleToggleActive(m)}
                        className={`px-chip px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                          m.is_active
                            ? "border border-rose-300 text-rose-700 hover:bg-rose-50"
                            : "border border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                        }`}
                      >
                        {processingId === m.id ? "..." : m.is_active ? "Nonaktifkan" : "Buka Blokir"}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
