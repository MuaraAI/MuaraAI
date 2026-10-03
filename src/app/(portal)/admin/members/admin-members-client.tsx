"use client";

import React, { useState } from "react";
import { Member } from "@/types/database";
import { toggleMemberActive } from "@/app/actions/admin";
import { calculateMemberBill } from "@/lib/dues";

interface AdminMembersClientProps {
  initialMembers: Member[];
}

export default function AdminMembersClient({ initialMembers }: AdminMembersClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [filterArrearsOnly, setFilterArrearsOnly] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleToggleActive = async (member: Member) => {
    const nextState = !member.is_active;
    const confirmMsg = nextState
      ? `Aktifkan kembali akses member @${member.github_username}?`
      : `Blacklist / Nonaktifkan akses member @${member.github_username}?`;

    if (!confirm(confirmMsg)) return;

    setProcessingId(member.id);
    const res = await toggleMemberActive(member.id, nextState);
    setProcessingId(null);

    if (res.success) {
      setMembers((prev) =>
        prev.map((m) => (m.id === member.id ? { ...m, is_active: nextState } : m))
      );
    } else {
      alert(`Gagal update status: ${res.error}`);
    }
  };

  const displayed = filterArrearsOnly
    ? members.filter((m) => {
        const bill = calculateMemberBill(m.dues_valid_until);
        return bill.isBlacklisted || bill.weeks > 0;
      })
    : members;

  return (
    <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="font-display font-bold text-base text-white">
          Daftar Seluruh Anggota ({displayed.length})
        </div>

        <label className="flex items-center gap-2 text-xs font-mono text-slate-300 cursor-pointer">
          <input
            type="checkbox"
            checked={filterArrearsOnly}
            onChange={(e) => setFilterArrearsOnly(e.target.checked)}
            className="rounded border-border text-muara-cyan focus:ring-0"
          />
          Hanya tampilkan yang memiliki tunggakan / batas blacklist
        </label>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="border-b border-border text-slate-500 uppercase">
              <th className="py-2.5 px-3">Member</th>
              <th className="py-2.5 px-3">Divisi & Track</th>
              <th className="py-2.5 px-3">Masa Aktif Kas</th>
              <th className="py-2.5 px-3">Tunggakan</th>
              <th className="py-2.5 px-3 text-center">Status Akses</th>
              <th className="py-2.5 px-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-slate-300">
            {displayed.map((m) => {
              const bill = calculateMemberBill(m.dues_valid_until);
              return (
                <tr key={m.id} className="hover:bg-background/40">
                  <td className="py-3 px-3">
                    <div className="font-bold text-white">{m.full_name}</div>
                    <div className="text-[10px] text-slate-400">@{m.github_username}</div>
                  </td>
                  <td className="py-3 px-3 capitalize">
                    {m.division} ({m.track || "General"})
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                    {m.dues_valid_until || "Belum Bayar"}
                  </td>
                  <td className="py-3 px-3">
                    {bill.weeks > 0 ? (
                      <span className="text-amber-400 font-bold">
                        {bill.weeks} minggu (Rp {bill.amount.toLocaleString("id-ID")})
                      </span>
                    ) : (
                      <span className="text-emerald-400">Lunas</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-center">
                    <span
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                        m.is_active
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : "bg-red-500/10 text-red-400 border border-red-500/30"
                      }`}
                    >
                      {m.is_active ? "Aktif" : "Blacklisted"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      disabled={processingId === m.id}
                      onClick={() => handleToggleActive(m)}
                      className={`rounded px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                        m.is_active
                          ? "border border-red-500/40 text-red-400 hover:bg-red-500/10"
                          : "border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                    >
                      {processingId === m.id
                        ? "..."
                        : m.is_active
                        ? "Blacklist"
                        : "Buka Blokir"}
                    </button>
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
