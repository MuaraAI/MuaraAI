"use client";

import React, { useState } from "react";
import { SentEmail } from "@/types/database";
import { sendBroadcastEmail } from "@/app/actions/admin";
import Icon from "@/components/ui/icon";

interface AdminMailClientProps {
  initialSentEmails: SentEmail[];
}

export default function AdminMailClient({ initialSentEmails }: AdminMailClientProps) {
  const [sentList, setSentList] = useState<SentEmail[]>(initialSentEmails);
  const [formData, setFormData] = useState({
    recipientType: "all",
    recipientEmail: "",
    subject: "",
    body: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Kirim email broadcast ini sekarang?")) return;

    setLoading(true);
    const res = await sendBroadcastEmail(formData);
    setLoading(false);

    if (res.success) {
      alert(`Email berhasil dikirim ke ${res.count || 1} penerima!`);
      window.location.reload();
    } else {
      alert(`Gagal mengirim: ${res.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Mail Composer Form */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Icon name="send" className="w-5 h-5 text-amber-400" />
          Tulis Pesan Broadcast
        </h2>

        <form onSubmit={handleSend} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Target Penerima
            </label>
            <select
              value={formData.recipientType}
              onChange={(e) => setFormData({ ...formData, recipientType: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            >
              <option value="all">Semua Member Aktif</option>
              <option value="builder">Khusus Divisi Builder</option>
              <option value="creative">Khusus Divisi Creative</option>
              <option value="custom">Email Tertentu (Custom)</option>
            </select>
          </div>

          {formData.recipientType === "custom" && (
            <div>
              <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
                Email Tujuan
              </label>
              <input
                type="email"
                required
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="nama@domain.com"
                className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Subjek Email
            </label>
            <input
              type="text"
              required
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="misal: [Pengumuman] Jadwal Kickoff Riset Semester 1"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Isi Pesan (Markdown / Plain Text)
            </label>
            <textarea
              required
              rows={5}
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Tulis pesan lengkap di sini..."
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-muara-cyan hover:bg-muara-cyan-light py-2.5 font-sans font-bold text-background transition-all disabled:opacity-50"
          >
            {loading ? "Mengirim Email..." : "Kirim Broadcast via Resend"}
          </button>
        </form>
      </div>

      {/* Outbox Sent Log */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="history" className="w-5 h-5 text-amber-400" />
            Riwayat Email Terkirim (Outbox)
          </h2>

          {sentList.length === 0 ? (
            <div className="text-slate-500 text-xs font-mono py-8 text-center">
              Belum ada email yang dikirim melalui console.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-slate-500 uppercase">
                    <th className="py-2 px-2">Penerima</th>
                    <th className="py-2 px-2">Subjek</th>
                    <th className="py-2 px-2 text-right">Waktu</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-slate-300">
                  {sentList.map((s) => (
                    <tr key={s.id} className="hover:bg-background/40">
                      <td className="py-2.5 px-2">
                        <span className="rounded bg-surface-hover border border-border px-1.5 py-0.5 text-[10px] uppercase font-bold text-muara-cyan block mb-0.5 w-fit">
                          {s.recipient_type}
                        </span>
                        <div className="text-[11px] text-slate-400">{s.recipient_email}</div>
                      </td>
                      <td className="py-2.5 px-2 max-w-[160px] truncate font-medium text-white">
                        {s.subject}
                      </td>
                      <td className="py-2.5 px-2 text-right text-slate-500 text-[10px]">
                        {new Date(s.created_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
