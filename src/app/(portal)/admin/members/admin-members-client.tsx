"use client";

import React, { useState } from "react";
import { Member } from "@/types/database";
import { toggleMemberActive, syncOrgCommits } from "@/app/actions/admin";
import { calculateMemberBill } from "@/lib/dues";
import Icon from "@/components/ui/icon";
import { useFeedback } from "@/components/ui/feedback";

interface AdminMembersClientProps {
  initialMembers: Member[];
}

export default function AdminMembersClient({ initialMembers }: AdminMembersClientProps) {
  const { confirm, notify } = useFeedback();
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [filterArrearsOnly, setFilterArrearsOnly] = useState(false);
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
        : { title: "Blacklist member ini?", message: `Akses @${member.github_username} ke portal dan repositori akan dinonaktifkan.`, confirmLabel: "Blacklist", tone: "danger" },
    );
    if (!ok) return;

    setProcessingId(member.id);
    const res = await toggleMemberActive(member.id, nextState);
    setProcessingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: nextState } : m))
      );
      notify({ tone: "success", title: nextState ? "Akses diaktifkan kembali" : "Member di-blacklist", message: `@${member.github_username}` });
    } else {
      notify({ tone: "error", title: "Gagal update status", message: String(res.error ?? "Terjadi kesalahan.") });
    }
  };

  const displayed = filterArrearsOnly
    ? members.filter((m) => {
        const bill = calculateMemberBill(m.dues_valid_until);
        return bill.isBlacklisted || bill.weeks > 0;
      })
    : members;

  return (
    <div className="px-card bg-white p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="font-display font-bold text-base text-foreground">
            Daftar Seluruh Anggota ({displayed.length})
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

        <label className="flex items-center gap-2 text-xs font-mono text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={filterArrearsOnly}
            onChange={(e) => setFilterArrearsOnly(e.target.checked)}
            className="border-stroke text-muara-ocean focus:ring-0"
          />
          Hanya tampilkan yang memiliki tunggakan / batas blacklist
        </label>
      </div>

      <div className="scroll-slim overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-stroke text-secondary uppercase">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Lifecycle</th>
              <th className="py-2.5 px-3 text-center">Commits</th>
              <th className="py-2.5 px-3">Intake</th>
              <th className="py-2.5 px-3">Mulai Membership</th>
              <th className="py-2.5 px-3">Masa Aktif Kas</th>
              <th className="py-2.5 px-3">Tunggakan</th>
              <th className="py-2.5 px-3 text-center">Status Akses</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stroke text-slate-700">
            {displayed.map((m) => {
              const bill = calculateMemberBill(m.dues_valid_until);
              const exited = m.membership_status === "exited" || m.reapply_blocked;
              return (
                <tr key={m.id} className="hover:bg-surface-alt/60">
                  <td className="py-3 px-3">
                    <div className="font-bold text-foreground">{m.full_name}</div>
                    <div className="text-[10px] text-secondary">@{m.github_username}</div>
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
                  <td className="py-3 px-3 text-secondary">
                    {m.dues_valid_until ? new Date(m.dues_valid_until).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "Belum Bayar"}
                  </td>
                  <td className="py-3 px-3">
                    {bill.weeks > 0 ? (
                      <span className="text-amber-700 font-bold">
                        {bill.weeks} minggu (Rp {bill.amount.toLocaleString("id-ID")})
                      </span>
                    ) : (
                      <span className="text-emerald-700">Lunas</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span className={`px-chip inline-block px-2 py-0.5 text-[10px] font-bold uppercase ${
                      m.is_active
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                        : "bg-rose-50 text-rose-800 border border-rose-200"
                    }`}>
                      {m.is_active ? "Aktif" : "Blacklisted"}
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
                        {processingId === m.id ? "..." : m.is_active ? "Blacklist" : "Buka Blokir"}
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
