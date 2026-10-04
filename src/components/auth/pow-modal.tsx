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
      <div className="rounded-xl border border-teal-200 bg-teal-50/70 p-8 text-center max-w-lg mx-auto shadow-ocean-lg">
        <span className="material-symbols-rounded text-5xl text-teal-700 mb-4 block">check_circle</span>
        <h2 className="font-display text-2xl font-bold text-teal-950 mb-2">Proof of Work Terkirim!</h2>
        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          Pengurus inti (Core Team) telah menerima berkas karya Anda. Review dilakukan secara manual dalam 1x24 jam. 
          Undangan resmi bergabung ke GitHub Org akan dikirimkan otomatis ke akun GitHub Anda setelah disetujui.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-white border border-border-ocean px-6 py-2.5 text-xs font-semibold text-foreground hover:border-muara-ocean transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border-ocean bg-white p-8 max-w-xl mx-auto shadow-ocean-lg">
      <div className="mb-6">
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Form Pendaftaran Proof of Work
        </h2>
        <p className="text-xs text-slate-500">
          Muara AI hanya memproses pendaftar yang menyertakan bukti karya nyata dan menguasai toolchain rekayasa.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <span className="material-symbols-rounded text-base text-rose-700">error</span>
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        <div>
          <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
            Nama Lengkap <span className="text-rose-600">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            placeholder="misal: Yuken Velino"
            className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              NIM Mahasiswa (Opsional)
            </label>
            <input
              type="text"
              value={formData.nim || ""}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
              placeholder="misal: 15260767"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              WhatsApp / Kontak <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.phoneWa || ""}
              onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              Divisi Pilihan <span className="text-rose-600">*</span>
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
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
            >
              <option value="builder">Kluster Builder</option>
              <option value="creative">Kluster Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              Track Spesialisasi <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.track}
              onChange={(e) => setFormData({ ...formData, track: e.target.value })}
              placeholder="misal: AI Agent, Backend, Video Motion"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
            Tautan Repositori / Portofolio Karya <span className="text-rose-600">*</span>
          </label>
          <input
            type="url"
            required
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            placeholder="https://github.com/username/project atau link live demo"
            className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
            Toolchain & Workflow yang Dikuasai <span className="text-rose-600">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.toolchainNarrative}
            onChange={(e) => setFormData({ ...formData, toolchainNarrative: e.target.value })}
            placeholder="Jelaskan toolchain nyata Anda (misal: Next.js 15, FastAPI, Cursor, Claude Code, TDD, Midjourney/ComfyUI)..."
            className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark py-3 font-sans font-bold text-white text-sm transition-all disabled:opacity-50 shadow-ocean mt-2"
        >
          {loading ? "Mengirimkan Berkas..." : "Submit Proof of Work"}
        </button>
      </form>
    </div>
  );
}
