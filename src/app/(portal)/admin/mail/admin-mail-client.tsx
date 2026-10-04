"use client";

import React, { useState } from "react";
import { SentEmail, InboxMessage } from "@/types/database";
import { sendBroadcastEmail } from "@/app/actions/admin";
import { replyInboxMessage, markInboxMessageRead } from "@/app/actions/contact";
import Icon from "@/components/ui/icon";

interface AdminMailClientProps {
  initialInboxMessages: InboxMessage[];
  initialSentEmails: SentEmail[];
}

export default function AdminMailClient({
  initialInboxMessages,
  initialSentEmails,
}: AdminMailClientProps) {
  const [activeTab, setActiveTab] = useState<"inbox" | "broadcast">("inbox");
  const [inboxList, setInboxList] = useState<InboxMessage[]>(initialInboxMessages);
  const [sentList, setSentList] = useState<SentEmail[]>(initialSentEmails);

  // Broadcast state
  const [broadcastForm, setBroadcastForm] = useState({
    recipientType: "all",
    recipientEmail: "",
    subject: "",
    body: "",
  });
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Reply modal state
  const [selectedMessage, setSelectedMessage] = useState<InboxMessage | null>(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);

  const unreadCount = inboxList.filter((m) => m.status === "unread").length;

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm("Kirim email broadcast ini sekarang?")) return;

    setBroadcastLoading(true);
    const res = await sendBroadcastEmail(broadcastForm);
    setBroadcastLoading(false);

    if (res.success) {
      alert(`Email berhasil dikirim ke ${res.count || 1} penerima!`);
      const newSent: SentEmail = {
        id: Math.random().toString(),
        recipient_type: broadcastForm.recipientType,
        recipient_email: broadcastForm.recipientEmail || "members@muaraai.com",
        subject: broadcastForm.subject,
        body: broadcastForm.body,
        sent_by: "Maintainer",
        created_at: new Date().toISOString(),
      };
      setSentList((prev) => [newSent, ...prev]);
      setBroadcastForm({ recipientType: "all", recipientEmail: "", subject: "", body: "" });
    } else {
      alert(`Gagal mengirim: ${res.error}`);
    }
  };

  const handleOpenReply = async (msg: InboxMessage) => {
    setSelectedMessage(msg);
    setReplySubject(`Re: ${msg.subject}`);
    setReplyBody("");

    if (msg.status === "unread") {
      setInboxList((prev) =>
        prev.map((m) => (m.id === msg.id ? { ...m, status: "read" } : m))
      );
      await markInboxMessageRead(msg.id);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMessage) return;

    setReplyLoading(true);
    const res = await replyInboxMessage({
      messageId: selectedMessage.id,
      replySubject,
      replyBody,
    });
    setReplyLoading(false);

    if (res.success) {
      alert(`Balasan resmi berhasil dikirim ke ${selectedMessage.sender_email}!`);
      setInboxList((prev) =>
        prev.map((m) =>
          m.id === selectedMessage.id
            ? { ...m, status: "replied", reply_body: replyBody, replied_at: new Date().toISOString() }
            : m
        )
      );
      // Append to outbox
      setSentList((prev) => [
        {
          id: Math.random().toString(),
          recipient_type: "external_partner",
          recipient_email: selectedMessage.sender_email,
          subject: replySubject,
          body: replyBody,
          sent_by: "Maintainer",
          created_at: new Date().toISOString(),
        },
        ...prev,
      ]);
      setSelectedMessage(null);
    } else {
      alert(`Gagal mengirim balasan: ${res.error}`);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Tab Switcher */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-lg border border-border w-fit text-xs font-mono">
        <button
          type="button"
          onClick={() => setActiveTab("inbox")}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-bold ${
            activeTab === "inbox"
              ? "bg-muara-ocean text-white shadow-sm"
              : "text-slate-600 hover:text-foreground hover:bg-white"
          }`}
        >
          <Icon name="mail" className="w-4 h-4" />
          <span>Kotak Masuk (Inbox)</span>
          {unreadCount > 0 && (
            <span className="bg-amber-500 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("broadcast")}
          className={`px-4 py-2 rounded-md transition-colors flex items-center gap-2 font-bold ${
            activeTab === "broadcast"
              ? "bg-muara-ocean text-white shadow-sm"
              : "text-slate-600 hover:text-foreground hover:bg-white"
          }`}
        >
          <Icon name="send" className="w-4 h-4" />
          <span>Broadcast & Outbox</span>
        </button>
      </div>

      {/* TAB 1: INBOX */}
      {activeTab === "inbox" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground font-display flex items-center gap-2">
              <Icon name="mark_email_unread" className="w-5 h-5 text-muara-ocean" />
              Pesan Masuk dari Mitra / Perusahaan Luar ({inboxList.length})
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {unreadCount} belum dibaca
            </span>
          </div>

          {inboxList.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center text-xs text-slate-500 font-mono">
              Belum ada pesan masuk dari pihak luar.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {inboxList.map((msg) => (
                <div
                  key={msg.id}
                  className={`rounded-xl border p-5 transition-all bg-white shadow-sm ${
                    msg.status === "unread"
                      ? "border-amber-300 ring-1 ring-amber-200"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                          msg.status === "unread"
                            ? "bg-amber-100 text-amber-800"
                            : msg.status === "replied"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {msg.status === "unread" ? "Baru" : msg.status === "replied" ? "Dibalas" : "Dibaca"}
                      </span>
                      <h3 className="font-bold text-sm text-foreground">{msg.subject}</h3>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {new Date(msg.created_at).toLocaleString("id-ID")}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                    <div>
                      Pengirim: <strong className="text-foreground">{msg.sender_name}</strong>
                    </div>
                    <div>
                      Email: <a href={`mailto:${msg.sender_email}`} className="text-muara-ocean underline">{msg.sender_email}</a>
                    </div>
                    {msg.organization && (
                      <div>
                        Organisasi: <span className="text-slate-800 font-medium">{msg.organization}</span>
                      </div>
                    )}
                  </div>

                  <div className="rounded-lg bg-slate-50 border border-slate-200/70 p-3.5 text-xs text-slate-700 whitespace-pre-wrap leading-relaxed font-sans mb-3">
                    {msg.message}
                  </div>

                  {msg.reply_body && (
                    <div className="rounded-lg bg-emerald-50 border border-emerald-200/70 p-3.5 text-xs text-emerald-900 whitespace-pre-wrap leading-relaxed font-sans mb-3">
                      <div className="font-bold text-[11px] font-mono uppercase text-emerald-700 mb-1 flex items-center gap-1.5">
                        <Icon name="check_circle" className="w-3.5 h-3.5" />
                        Balasan Resmi Terkirim ({msg.replied_at ? new Date(msg.replied_at).toLocaleString("id-ID") : ""}):
                      </div>
                      {msg.reply_body}
                    </div>
                  )}

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => handleOpenReply(msg)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white text-xs font-bold transition-all shadow-sm"
                    >
                      <Icon name="reply" className="w-4 h-4" />
                      {msg.status === "replied" ? "Kirim Balasan Lagi" : "Balas Pesan"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: BROADCAST & OUTBOX */}
      {activeTab === "broadcast" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mail Composer Form */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8 space-y-4 shadow-sm">
            <h2 className="font-display text-lg font-bold text-foreground mb-2 flex items-center gap-2">
              <Icon name="send" className="w-5 h-5 text-muara-ocean" />
              Tulis Pesan Broadcast Komunitas
            </h2>

            <form onSubmit={handleSendBroadcast} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Target Penerima
                </label>
                <select
                  value={broadcastForm.recipientType}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, recipientType: e.target.value })}
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                >
                  <option value="all">Semua Member Aktif</option>
                  <option value="builder">Khusus Divisi Builder</option>
                  <option value="creative">Khusus Divisi Creative</option>
                  <option value="custom">Email Tertentu (Custom)</option>
                </select>
              </div>

              {broadcastForm.recipientType === "custom" && (
                <div>
                  <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                    Email Tujuan
                  </label>
                  <input
                    type="email"
                    required
                    value={broadcastForm.recipientEmail}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, recipientEmail: e.target.value })}
                    placeholder="nama@domain.com"
                    className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Subjek Email
                </label>
                <input
                  type="text"
                  required
                  value={broadcastForm.subject}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, subject: e.target.value })}
                  placeholder="misal: [Pengumuman] Jadwal Kickoff Riset Semester 1"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Isi Pesan (Plain Text / Markdown)
                </label>
                <textarea
                  required
                  rows={5}
                  value={broadcastForm.body}
                  onChange={(e) => setBroadcastForm({ ...broadcastForm, body: e.target.value })}
                  placeholder="Tulis pesan lengkap di sini..."
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={broadcastLoading}
                className="w-full rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark py-2.5 font-sans font-bold text-white transition-all disabled:opacity-50 shadow-sm"
              >
                {broadcastLoading ? "Mengirim Email..." : "Kirim Broadcast via Resend"}
              </button>
            </form>
          </div>

          {/* Outbox Sent Log */}
          <div className="rounded-xl border border-border bg-white p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h2 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                <Icon name="history" className="w-5 h-5 text-muara-ocean" />
                Riwayat Email Terkirim (Outbox)
              </h2>

              {sentList.length === 0 ? (
                <div className="text-slate-500 text-xs font-mono py-8 text-center bg-slate-50 rounded-lg border border-dashed border-border">
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
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {sentList.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-2">
                            <span className="rounded bg-sky-50 border border-sky-200 px-1.5 py-0.5 text-[10px] uppercase font-bold text-muara-ocean block mb-0.5 w-fit">
                              {s.recipient_type}
                            </span>
                            <div className="text-[11px] text-slate-500">{s.recipient_email}</div>
                          </td>
                          <td className="py-2.5 px-2 max-w-[160px] truncate font-medium text-foreground">
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
      )}

      {/* REPLY MODAL DIALOG */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground flex items-center gap-2">
                  <Icon name="reply" className="w-5 h-5 text-muara-ocean" />
                  Balas Pesan Resmi
                </h3>
                <p className="text-xs text-slate-500">
                  Kepada: <strong>{selectedMessage.sender_name}</strong> ({selectedMessage.sender_email})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedMessage(null)}
                className="text-slate-400 hover:text-foreground text-sm font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-xs text-slate-600 max-h-36 overflow-y-auto font-sans">
              <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Pesan Asli Pengirim:</div>
              {selectedMessage.message}
            </div>

            <form onSubmit={handleSendReply} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Subjek Balasan
                </label>
                <input
                  type="text"
                  required
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Isi Balasan (Terkirim dari admin@muaraai.com)
                </label>
                <textarea
                  required
                  rows={6}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder="Tulis balasan resmi komunitas Anda di sini..."
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 rounded-lg border border-border text-slate-600 hover:bg-slate-100 font-sans text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={replyLoading}
                  className="px-5 py-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white font-sans font-bold text-xs transition-all disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  <Icon name="send" className="w-4 h-4" />
                  {replyLoading ? "Mengirim Balasan..." : "Kirim Balasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
