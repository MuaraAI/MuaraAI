"use client";

import React, { useState } from "react";
import { submitProofOfWork } from "@/app/actions/pow";
import { PoWInput } from "@/lib/validation";
import { UBSI_CAMPUSES, UBSI_PRODI_LIST } from "@/lib/constants";
import Icon from "@/components/ui/icon";

export default function PoWForm() {
  const [formData, setFormData] = useState<PoWInput>({
    fullName: "",
    nim: "",
    campus: "UBSI Pontianak",
    prodi: "Informatika (S1)",
    kelas: "",
    phoneWa: "",
    division: "builder",
    track: "Web & Apps Systems",
    portfolioUrl: "",
    websiteUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    xUrl: "",
    threadsUrl: "",
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
      <div className="rounded-2xl border border-border bg-white p-8 text-center max-w-lg mx-auto shadow-sm">
        <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200">
          <Icon name="check_circle" className="w-7 h-7" />
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Proof of Work Terkirim!</h2>
        <p className="text-xs text-slate-600 leading-relaxed mb-6">
          Berkas karya dan identitas mahasiswa UBSI Anda telah diterima. Core Team maintainer akan memverifikasi karya Anda secara manual dalam 1x24 jam. Undangan bergabung ke GitHub Organization <strong>MuaraAI</strong> akan dikirimkan otomatis setelah disetujui.
        </p>
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean text-white px-6 py-2.5 text-xs font-semibold hover:bg-muara-ocean-dark transition-colors shadow-sm"
        >
          Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-white p-8 max-w-2xl mx-auto shadow-sm">
      <div className="mb-6">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-sky-50 border border-sky-200 text-muara-ocean text-[11px] font-mono font-bold uppercase mb-2">
          <Icon name="school" className="w-3.5 h-3.5" />
          <span>Eksklusif Mahasiswa UBSI</span>
        </div>
        <h2 className="font-display text-2xl font-bold text-foreground mb-1">
          Form Pendaftaran Proof of Work
        </h2>
        <p className="text-xs text-slate-500">
          Komunitas riset dan rekayasa AI independen khusus mahasiswa Universitas Bina Sarana Informatika (UBSI).
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-800 flex items-center gap-2">
          <Icon name="error" className="w-4 h-4 text-rose-700 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
        {/* Row 1: Nama & WhatsApp */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              WhatsApp / Kontak Aktif <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.phoneWa}
              onChange={(e) => setFormData({ ...formData, phoneWa: e.target.value })}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Row 2: NIM & Kode Kelas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              NIM Mahasiswa UBSI (8 Digit) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={8}
              value={formData.nim}
              onChange={(e) => setFormData({ ...formData, nim: e.target.value.replace(/\D/g, "") })}
              placeholder="misal: 15260767"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              Kode Kelas (SIAKAD) <span className="text-rose-600">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value.toUpperCase() })}
              placeholder="misal: 15.1C.30"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none uppercase"
            />
          </div>
        </div>

        {/* Row 3: Kampus UBSI & Prodi */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              Kampus Asal UBSI <span className="text-rose-600">*</span>
            </label>
            <select
              value={formData.campus}
              onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
            >
              {UBSI_CAMPUSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
              Program Studi (Prodi) <span className="text-rose-600">*</span>
            </label>
            <select
              value={formData.prodi}
              onChange={(e) => setFormData({ ...formData, prodi: e.target.value })}
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
            >
              {UBSI_PRODI_LIST.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 4: Divisi & Track */}
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
              <option value="builder">Kluster Builder (Software, Backend, AI Systems)</option>
              <option value="creative">Kluster Creative (UI/UX, Brand Identity, Media)</option>
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
              placeholder="misal: AI Agent, Backend FastAPI, UI Engineering"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>
        </div>

        {/* Row 5: Portfolio URL */}
        <div>
          <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
            Tautan Repositori GitHub / Portofolio Karya Nyata <span className="text-rose-600">*</span>
          </label>
          <input
            type="url"
            required
            value={formData.portfolioUrl}
            onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
            placeholder="https://github.com/username/project atau tautan live demo"
            className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        {/* Row 6: Toolchain narrative */}
        <div>
          <label className="block text-slate-700 mb-1.5 font-sans font-medium text-xs">
            Toolchain & Workflow yang Dikuasai <span className="text-rose-600">*</span>
          </label>
          <textarea
            required
            rows={3}
            value={formData.toolchainNarrative}
            onChange={(e) => setFormData({ ...formData, toolchainNarrative: e.target.value })}
            placeholder="Jelaskan workflow kerja nyata Anda (misal: Next.js 15, FastAPI, Cursor/Claude Code, Python Scrapling, TDD, Figma, ComfyUI)..."
            className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        {/* Row 7: Tautan Web & Media Sosial Mahasiswa */}
        <div className="pt-3 border-t border-border">
          <div className="font-sans font-bold text-xs text-foreground mb-3 flex items-center gap-1.5">
            <Icon name="link" className="w-4 h-4 text-muara-ocean" />
            <span>Tautan Web & Media Sosial Mahasiswa (Opsional)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                Website Pribadi / Blog
              </label>
              <input
                type="url"
                value={formData.websiteUrl || ""}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://yoursite.dev"
                className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                LinkedIn Profile
              </label>
              <input
                type="url"
                value={formData.linkedinUrl || ""}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                Instagram (@ atau URL)
              </label>
              <input
                type="text"
                value={formData.instagramUrl || ""}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                placeholder="@username atau URL profil"
                className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                X / Twitter (@ atau URL)
              </label>
              <input
                type="text"
                value={formData.xUrl || ""}
                onChange={(e) => setFormData({ ...formData, xUrl: e.target.value })}
                placeholder="@username atau URL profil"
                className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark py-3 font-sans font-bold text-white text-sm transition-all disabled:opacity-50 shadow-sm mt-2 flex items-center justify-center gap-2"
        >
          <Icon name="verified" className="w-4 h-4" />
          <span>{loading ? "Memvalidasi & Mengirim..." : "Kirim Proof of Work Mahasiswa UBSI"}</span>
        </button>
      </form>
    </div>
  );
}
