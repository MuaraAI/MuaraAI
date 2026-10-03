"use client";

import React, { useState } from "react";
import { submitProofOfWork } from "@/app/actions/pow";
import { PoWInput } from "@/lib/validation";

export default function PoWForm() {
  const [formData, setFormData] = useState<PoWInput>({
    fullName: "",
    nim: "",
    phoneWa: "",
    division: "builder",
    track: "Web & Apps Systems",
    portfolioUrl: "",
    toolchainNarrative: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await submitProofOfWork(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
    } else {
      setError(res.error || "Gagal mengirimkan Proof of Work.");
    }
  };

  if (success) {
    return (
      <div className="rounded-xl border border-emerald-500/40 bg-surface p-8 text-center max-w-lg mx-auto shadow-2xl">
        <span className="material-symbols-rounded text-5xl text-emerald-400 mb-4 block">check_circle</span>
        <h2 className="font-display text-2xl font-bold text-white mb-2">Proof of Work Terkirim!</h2>
        <p className="text-sm text-slate-300 leading-relaxed mb-6">
          Pengurus inti (Core Team) telah menerima berkas karya Anda. Review dilakukan secara manual dalam 1x24 jam. 
          Undangan resmi bergabung ke GitHub Org akan dikirimkan otomatis ke akun GitHub Anda setelah disetujui.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-surface-hover border border-border px-6 py-2.5 text-xs font-semibold text-white hover:border-muara-cyan transition-colors"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8 max-w-xl mx-auto shadow-2xl">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-white mb-1">
          Form Pendaftaran Proof of Work
        </h2>
        <p className="text-xs text-slate-400">
          Muara AI hanya memproses pendaftar yang menyertakan bukti karya nyata dan menguasai toolchain rekayasa.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-500/40 bg-red-950/20 p-3.5 text-xs text-red-300 flex items-center gap-2">
          <span className="material-symbols-rounded text-base text-red-400">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div>
          <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
            Nama Lengkap <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="misal: Yuken Velino"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
              NIM Mahasiswa (Opsional)
            </label>
            <input
              type="text"
              value={formData.nim || ""}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              placeholder="misal: 15260767"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
              WhatsApp / Kontak <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.phoneWa || ""}
              onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
              Divisi Pilihan <span className="text-red-400">*</span>
            </label>
            <select
              value={formData.division}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  division: e.target.value as "builder" | "creative",
                  track: e.target.value === "builder" ? "Web & Apps Systems" : "Image & Visual Brand",
                })
              }
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            >
              <option value="builder">Kluster Builder</option>
              <option value="creative">Kluster Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
              Track Spesialisasi <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              placeholder="misal: AI Agent, Backend, Video Motion"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
            Tautan Repositori / Portofolio Karya <span className="text-red-400">*</span>
          </label>
          <input
            type="url"
            required
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            placeholder="https://github.com/username/project atau link live demo"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-300 mb-1.5 font-sans font-medium text-xs">
            Toolchain & Workflow yang Dikuasai <span className="text-red-400">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.toolchainNarrative}
            onChange={(e) => setFormData({ ...formData, toolchainNarrative: e.target.value })}
            placeholder="Jelaskan toolchain nyata Anda (misal: Next.js 15, FastAPI, Cursor, Claude Code, TDD, Midjourney/ComfyUI)..."
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white placeholder-slate-600 focus:border-muara-cyan focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-muara-cyan hover:bg-muara-cyan-light py-3 font-sans font-bold text-background text-sm transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.3)] mt-2"
        >
          {loading ? "Mengirimkan Berkas..." : "Submit Proof of Work"}
        </button>
      </form>
    </div>
  );
}
