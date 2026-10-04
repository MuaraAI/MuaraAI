"use client";

import React, { useState } from "react";
import { submitContactMessage } from "@/app/actions/contact";
import Icon from "@/components/ui/icon";

export default function ContactModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    senderName: "",
    senderEmail: "",
    organization: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await submitContactMessage(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setFormData({
        senderName: "",
        senderEmail: "",
        organization: "",
        subject: "",
        message: "",
      });
    } else {
      alert(`Gagal mengirim pesan: ${res.error}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 sm:p-8 shadow-2xl relative font-sans">
        <button
          type="button"
          onClick={() => {
            setSuccess(false);
            onClose();
          }}
          className="absolute top-5 right-5 text-slate-400 hover:text-foreground text-sm font-mono p-1"
        >
          ✕
        </button>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <Icon name="check_circle" className="w-7 h-7" />
            </div>
            <h3 className="font-display font-bold text-xl text-foreground">
              Pesan Berhasil Terkirim!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto leading-relaxed">
              Terima kasih telah menghubungi Muara AI. Pesan Anda telah masuk ke pusat kendali maintainer kami dan akan dibalas melalui email dalam 1x24 jam.
            </p>
            <button
              type="button"
              onClick={() => {
                setSuccess(false);
                onClose();
              }}
              className="mt-4 px-6 py-2 rounded-lg bg-muara-ocean text-white font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-6">
              <h3 className="font-display font-bold text-xl text-foreground flex items-center gap-2">
                <Icon name="mail" className="w-5 h-5 text-muara-ocean" />
                Hubungi Kami & Kemitraan
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Punya tawaran riset, project kolaborasi, undangan kompetisi, atau sponsorship? Kirim pesan langsung ke Core Team Muara AI.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                    Nama Anda / PIC *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.senderName}
                    onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                    placeholder="misal: Budi Santoso"
                    className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                    Email Resmi *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.senderEmail}
                    onChange={(e) => setFormData({ ...formData, senderEmail: e.target.value })}
                    placeholder="nama@perusahaan.com"
                    className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Perusahaan / Instansi / Startup (Opsional)
                </label>
                <input
                  type="text"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="misal: PT Teknologi Maju / Kampus"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Perihal / Subjek *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="misal: Peluang Kolaborasi Riset & Proyek AI"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Isi Pesan Lengkap *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Jelaskan kebutuhan kerjasama, sponsorship, atau agenda Anda..."
                  className="w-full rounded-lg border border-border bg-slate-50 px-3 py-2 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none font-mono"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg border border-border text-slate-600 hover:bg-slate-100 font-sans text-xs"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white font-sans font-bold text-xs transition-all disabled:opacity-50 shadow-sm flex items-center gap-1.5"
                >
                  <Icon name="send" className="w-4 h-4" />
                  {loading ? "Mengirim..." : "Kirim Pesan"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
