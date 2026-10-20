"use client";

import React, { useState } from "react";
import { logExpense } from "@/app/actions/admin";
import Icon from "@/components/ui/icon";
import { PortalHeader } from "@/components/ui/section";
import PixelSelect from "@/components/ui/pixel-select";
import { useFeedback } from "@/components/ui/feedback";

export default function AdminTreasuryPage() {
  const { notify } = useFeedback();
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
      notify({ tone: "error", title: "Gagal mencatat pengeluaran", message: String(res.error ?? "Terjadi kesalahan.") });
    }
  };

  return (
    <div className="space-y-8 max-w-xl">
      <PortalHeader eyebrow="Maintainer workspace" title="Pencatatan Pengeluaran Kas">
          Catat pengeluaran operasional resmi komunitas (sewa VPS Tencent, domain, pendaftaran lomba). Otomatis tercatat di open ledger.
      </PortalHeader>

      {success && (
        <div className="px-frame [--px-line:#6EE7B7] bg-emerald-50 p-4 text-xs text-emerald-900 flex items-center gap-2">
          <Icon name="check_circle" className="w-5 h-5 text-emerald-600" />
          <span>Pengeluaran kas berhasil dicatat dan masuk ke ledger publik!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="px-card bg-white p-6 sm:p-8 space-y-4 text-xs font-mono">
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
            className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
            Kategori
          </label>
          <PixelSelect
            aria-label="Kategori"
            value={formData.category}
            onChange={(category) => setFormData({ ...formData, category })}
            options={[
              { value: "server", label: "Sewa Server / VPS" },
              { value: "domain", label: "Domain & DNS" },
              { value: "competition", label: "Registrasi Lomba / Hackathon" },
              { value: "other", label: "Operasional Lainnya" },
            ]}
          />
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
            className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-foreground placeholder-slate-400 focus:border-muara-ocean focus:bg-white focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-btn w-full py-2.5 font-sans font-bold disabled:opacity-50"
        >
          {loading ? "Menyimpan..." : "Catat Pengeluaran"}
        </button>
      </form>
    </div>
  );
}
