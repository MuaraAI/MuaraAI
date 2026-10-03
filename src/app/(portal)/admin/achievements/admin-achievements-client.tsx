"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Achievement } from "@/types/database";
import { addAchievement } from "@/app/actions/admin";

interface AdminAchievementsClientProps {
  initialAchievements: Achievement[];
}

export default function AdminAchievementsClient({
  initialAchievements,
}: AdminAchievementsClientProps) {
  const [list, setList] = useState<Achievement[]>(initialAchievements);
  const [formData, setFormData] = useState({
    title: "",
    issuer: "",
    issueDate: new Date().toISOString().slice(0, 10),
    imageUrl: "",
    credentialUrl: "",
    recipientsStr: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const names = formData.recipientsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await addAchievement({
      title: formData.title,
      issuer: formData.issuer,
      issueDate: formData.issueDate,
      imageUrl: formData.imageUrl,
      credentialUrl: formData.credentialUrl || undefined,
      recipientNames: names,
    });

    setLoading(false);

    if (res.success) {
      alert("Prestasi/sertifikat berhasil ditambahkan!");
      window.location.reload();
    } else {
      alert(`Gagal menambah: ${res.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Upload Form */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
          <span className="material-symbols-rounded text-amber-400">workspace_premium</span>
          Tambah Prestasi Baru
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Judul Penghargaan / Kejuaraan
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="misal: Juara 1 AI Innovation Hackathon 2026"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Penyelenggara / Institusi
            </label>
            <input
              type="text"
              required
              value={formData.issuer}
              onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
              placeholder="misal: Kementerian Komdigi / LLDIKTI XI"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Tanggal Penerbitan
            </label>
            <input
              type="date"
              required
              value={formData.issueDate}
              onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Gambar Scan Sertifikat (URL Gambar Resolusi Tinggi)
            </label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://... (URL gambar bukti sertifikat)"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Link Verifikasi Kredensial / PDF (Opsional)
            </label>
            <input
              type="url"
              value={formData.credentialUrl}
              onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
              placeholder="https://credential.net/..."
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Nama Anggota Peraih (Pisahkan dengan koma)
            </label>
            <input
              type="text"
              value={formData.recipientsStr}
              onChange={(e) => setFormData({ ...formData, recipientsStr: e.target.value })}
              placeholder="Yuken Velino, M Raffli, Verzio"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-muara-cyan hover:bg-muara-cyan-light py-2.5 font-sans font-bold text-background transition-all disabled:opacity-50"
          >
            {loading ? "Menyimpan..." : "Simpan Prestasi"}
          </button>
        </form>
      </div>

      {/* List Existing */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="material-symbols-rounded text-amber-400">list</span>
            Daftar Sertifikat Terdaftar ({list.length})
          </h2>

          {list.length === 0 ? (
            <div className="text-slate-500 text-xs font-mono py-8 text-center">
              Belum ada sertifikat terdaftar.
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[500px]">
              {list.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/80 bg-background/60 p-3.5 flex items-center gap-3"
                >
                  <div className="relative h-12 w-16 rounded overflow-hidden bg-background shrink-0">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs text-white truncate">{item.title}</div>
                    <div className="text-[11px] font-mono text-slate-400">
                      {item.issuer} • {item.issue_date}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
