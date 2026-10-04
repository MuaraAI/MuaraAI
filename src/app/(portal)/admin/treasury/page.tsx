"use client";

import React, { useState } from "react";
import { logExpense } from "@/app/actions/admin";
import Icon from "@/components/ui/icon";

export default function AdminTreasuryPage() {
  const [formData, setFormData] = useState({
    amount: 150000,
    category: "server",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(false);

    const res = await logExpense(formData);
    setLoading(false);

    if (res.success) {
      setSuccess(true);
      setFormData({ amount: 0, category: "server", description: "" });
    } else {
      alert(`Gagal mencatat pengeluaran: ${res.error}`);
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Pencatatan Pengeluaran Kas
        </h1>
        <p className="text-xs text-secondary font-sans">
          Catat pengeluaran operasional resmi komunitas (sewa VPS Tencent, domain, pendaftaran lomba). Otomatis tercatat di open ledger.
        </p>
      </div>

      {success && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
          <Icon name="check_circle" className="w-5 h-5 text-emerald-600" />
          <span>Pengeluaran kas berhasil dicatat dan masuk ke ledger publik!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-[18px] border border-stroke bg-white p-6 sm:p-8 space-y-4 text-xs font-mono shadow-diffusion">
        <div>
          <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
            Nominal Pengeluaran (IDR)
          </label>
          <input
            type="number"
            required
            min={1000}
            value={formData.amount || ""}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            className="w-full rounded-[8px] border border-stroke bg-surface-alt px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
            Kategori
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full rounded-[8px] border border-stroke bg-surface-alt px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none capitalize"
          >
            <option value="server">Sewa Server / VPS</option>
            <option value="domain">Domain & DNS</option>
            <option value="competition">Registrasi Lomba / Hackathon</option>
            <option value="other">Operasional Lainnya</option>
          </select>
        </div>

        <div>
          <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
            Keterangan & Rincian Pengeluaran
          </label>
          <textarea
            required
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="misal: Perpanjangan VPS Tencent Bulan Oktober 2026 (Bukti transfer terlampir)..."
            className="w-full rounded-[8px] border border-stroke bg-surface-alt px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-[8px] bg-muara-ocean hover:bg-muara-ocean-dark py-2.5 font-sans font-bold text-white transition-all disabled:opacity-50 shadow-xs"
        >
          {loading ? "Menyimpan..." : "Catat Pengeluaran"}
        </button>
      </form>
    </div>
  );
}
