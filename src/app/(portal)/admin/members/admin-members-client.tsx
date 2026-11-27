"use client";

import React, { useState } from "react";
import { Member } from "@/types/database";
import { toggleMemberActive, syncOrgCommits, setMemberRole } from "@/app/actions/admin";
import type { PositionsConfig } from "@/lib/positions";
import { isMaintainer } from "@/lib/guards";
import { DIVISIONS, DIVISION_NAMES, applyRole, divisionsOf, headOf, hierarchyFor, isDivision, roleBadges, type Division, type RoleChange } from "@/lib/structure";
import Icon from "@/components/ui/icon";
import { useFeedback } from "@/components/ui/feedback";

interface AdminMembersClientProps {
  initialMembers: Member[];
  positions: PositionsConfig | null;
}

const SELECT_CLASS = "min-h-9 border-2 border-[#CFE2EE] bg-surface-alt px-2 py-1 text-[11px] text-foreground focus:border-muara-ocean";

const toggle = <T,>(list: T[], value: T): T[] => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);

function Check({ label, ariaLabel, checked, onChange }: { label: string; ariaLabel: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="inline-flex min-h-7 items-center gap-1.5 text-[11px] text-foreground">
      <input type="checkbox" aria-label={ariaLabel} checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

/** Access, divisions, the divisions they lead, primary division and positions of one person, saved together. */
function RoleCell({ member, positions, busy, onSave }: { member: Member; positions: PositionsConfig; busy: boolean; onSave: (change: RoleChange) => void }) {
  const initial: RoleChange = {
    maintainer: isMaintainer(member),
    divisions: divisionsOf(member),
    primary: isDivision(member.division) ? member.division : "builder",
    headOf: headOf(member),
    tracks: member.tracks ?? [],
  };
  const [maintainer, setMaintainer] = useState(initial.maintainer);
  const [divisions, setDivisions] = useState<Division[]>(initial.divisions);
  const [primary, setPrimary] = useState<Division>(initial.primary);
  const [heads, setHeads] = useState<Division[]>(initial.headOf);
  const [tracks, setTracks] = useState<string[]>(initial.tracks);
  const name = member.full_name;

  const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((value) => b.includes(value));
  const dirty =
    maintainer !== initial.maintainer || primary !== initial.primary || !sameList(divisions, initial.divisions) || !sameList(heads, initial.headOf) || !sameList(tracks, initial.tracks);

  const toggleDivision = (division: Division) => {
    const next = toggle(divisions, division);
    setDivisions(next);
    setHeads((current) => current.filter((head) => next.includes(head)));
    setTracks((current) => current.filter((track) => next.some((d) => (positions[d] ?? []).includes(track))));
    if (!next.includes(primary) && next[0]) setPrimary(next[0]);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {roleBadges(member).map((badge) => <span key={badge} className="px-chip bg-white px-2 py-0.5 text-[10px] font-bold text-muara-ocean">{badge}</span>)}
        <span className="text-[10px] text-secondary">Anggota: {divisionsOf(member).map((d) => DIVISION_NAMES[d]).join(", ") || "-"}</span>
      </div>
      <Check label="Maintainer (akses penuh admin)" ariaLabel={`Maintainer ${name}`} checked={maintainer} onChange={() => setMaintainer(!maintainer)} />
      <fieldset className="flex flex-wrap gap-x-3">
        <legend className="text-[10px] uppercase text-secondary">Divisi</legend>
        {DIVISIONS.map((division) => <Check key={division} label={DIVISION_NAMES[division]} ariaLabel={`Divisi ${DIVISION_NAMES[division]} ${name}`} checked={divisions.includes(division)} onChange={() => toggleDivision(division)} />)}
      </fieldset>
      {divisions.length > 0 && (
        <fieldset className="flex flex-wrap gap-x-3">
          <legend className="text-[10px] uppercase text-secondary">Head of</legend>
          {divisions.map((division) => <Check key={division} label={DIVISION_NAMES[division]} ariaLabel={`Head of ${DIVISION_NAMES[division]} ${name}`} checked={heads.includes(division)} onChange={() => setHeads(toggle(heads, division))} />)}
        </fieldset>
      )}
      <label className="flex items-center gap-1.5 text-[11px] text-foreground">
        Divisi utama
        <select aria-label={`Divisi utama ${name}`} value={primary} onChange={(e) => setPrimary(e.target.value as Division)} className={SELECT_CLASS}>
          {divisions.map((division) => <option key={division} value={division}>{DIVISION_NAMES[division]}</option>)}
        </select>
      </label>
      {divisions.map((division) =>
        (positions[division] ?? []).length > 0 ? (
          <fieldset key={division} className="flex flex-wrap gap-x-3">
            <legend className="text-[10px] uppercase text-secondary">Posisi {DIVISION_NAMES[division]}</legend>
            {(positions[division] ?? []).map((track) => <Check key={track} label={track} ariaLabel={`Posisi ${track} ${name}`} checked={tracks.includes(track)} onChange={() => setTracks(toggle(tracks, track))} />)}
          </fieldset>
        ) : null,
      )}
      <button
        type="button"
        disabled={!dirty || busy || divisions.length === 0}
        onClick={() => onSave({ maintainer, divisions, primary, headOf: heads, tracks })}
        className="px-chip border border-muara-ocean px-3 py-1 text-[11px] font-bold text-muara-ocean disabled:opacity-40"
      >
        Simpan peran
      </button>
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
    const touchesAccess = change.maintainer !== isMaintainer(member);
    const ok = await confirm({
      title: touchesAccess ? "Ubah akses maintainer?" : "Simpan peran baru?",
      message: touchesAccess
        ? `Maintainer punya akses penuh ke admin. Akses @${member.github_username} akan ${change.maintainer ? "diberikan" : "dicabut"}.`
        : `Peran @${member.github_username} akan diperbarui.`,
      confirmLabel: "Simpan",
    });
    if (!ok) return;

    setProcessingId(member.id);
    const res = await setMemberRole(member.id, change);
    setProcessingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id
            ? {
                ...m,
                hierarchy: hierarchyFor(m.hierarchy, change),
                roles: applyRole(m.roles, change),
                division: change.primary,
                divisions: change.divisions,
                head_of: change.headOf,
                tracks: change.tracks,
                track: change.tracks[0] ?? null,
              }
            : m,
        ),
      );
      notify({ tone: "success", title: "Peran disimpan", message: `@${member.github_username}` });
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
                      <RoleCell key={`${m.id}-${m.hierarchy}-${m.division}-${(m.divisions ?? []).join()}-${(m.head_of ?? []).join()}-${(m.tracks ?? []).join()}`} member={m} positions={positions} busy={processingId === m.id} onSave={(change) => handleSaveRole(m, change)} />
                    ) : (
                      <span className="font-bold text-foreground">{roleBadges(m).join(" · ") || "Member"}</span>
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
