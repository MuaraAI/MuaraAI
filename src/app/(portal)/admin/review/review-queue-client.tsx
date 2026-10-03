"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Member } from "@/types/database";
import { approveApplicant, rejectApplicant } from "@/app/actions/admin";

interface ReviewQueueClientProps {
  initialMembers: Member[];
}

export default function ReviewQueueClient({ initialMembers }: ReviewQueueClientProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const res = await approveApplicant(id);
    setProcessingId(null);
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } else {
      alert(`Gagal approve: ${res.error}`);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tolak calon anggota ini?")) return;
    setProcessingId(id);
    const res = await rejectApplicant(id);
    setProcessingId(null);
    if (res.success) {
      setMembers((prev) => prev.filter((m) => m.id !== id));
    } else {
      alert(`Gagal reject: ${res.error}`);
    }
  };

  if (members.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-slate-500 text-xs font-mono">
        Tidak ada pendaftar baru dalam antrean.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {members.map((m) => (
        <div key={m.id} className="rounded-xl border border-border bg-surface p-6 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border">
            <div>
              <div className="font-display font-bold text-base text-white">{m.full_name}</div>
              <div className="text-xs font-mono text-slate-400">
                @{m.github_username} • {m.division.toUpperCase()} ({m.track || "General"})
              </div>
            </div>
            <div className="text-xs font-mono text-slate-500">
              {new Date(m.created_at).toLocaleString("id-ID")}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500 block mb-1">Kontak WhatsApp:</span>
              <span className="text-slate-300">{m.phone_wa || "-"}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">NIM:</span>
              <span className="text-slate-300">{m.nim || "-"}</span>
            </div>
            <div className="sm:col-span-2">
              <span className="text-slate-500 block mb-1">Portofolio / Proof of Work:</span>
              <Link
                href={m.portfolio_url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muara-cyan hover:underline break-all"
              >
                {m.portfolio_url}
              </Link>
            </div>
            {m.bio && (
              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-1">Toolchain & Workflow:</span>
                <p className="text-slate-300 bg-background/60 p-3 rounded-lg border border-border whitespace-pre-wrap">
                  {m.bio}
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              disabled={processingId === m.id}
              onClick={() => handleReject(m.id)}
              className="rounded-lg border border-red-500/30 hover:bg-red-500/10 text-red-400 px-4 py-2 text-xs font-mono transition-colors disabled:opacity-50"
            >
              Tolak
            </button>
            <button
              disabled={processingId === m.id}
              onClick={() => handleApprove(m.id)}
              className="rounded-lg bg-emerald-500 hover:bg-emerald-400 text-background px-5 py-2 text-xs font-mono font-bold transition-colors disabled:opacity-50"
            >
              {processingId === m.id ? "Memproses..." : "Approve & Invite Org"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
