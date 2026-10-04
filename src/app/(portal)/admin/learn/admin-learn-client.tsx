"use client";

import React, { useState } from "react";
import { LearningMaterial } from "@/types/database";
import { publishMaterial } from "@/app/actions/admin";
import Icon from "@/components/ui/icon";

interface ReadRecord {
  id: string;
  material_id: string;
  member_id: string;
  opened_at: string;
  members?: {
    full_name?: string;
    github_username?: string;
  };
}

interface AdminLearnClientProps {
  initialMaterials: LearningMaterial[];
  initialReads: ReadRecord[];
}

export default function AdminLearnClient({
  initialMaterials,
  initialReads,
}: AdminLearnClientProps) {
  const [materials, setMaterials] = useState<LearningMaterial[]>(initialMaterials);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resourceUrl: "",
    coverUrl: "",
    division: "all",
  });
  const [loading, setLoading] = useState(false);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await publishMaterial(formData);
    setLoading(false);

    if (res.success) {
      alert("Materi berhasil diterbitkan!");
      window.location.reload();
    } else {
      alert(`Gagal menerbitkan: ${res.error}`);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Publish Form */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 space-y-4">
        <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Icon name="upload_file" className="w-5 h-5 text-amber-400" />
          Terbitkan Materi Baru
        </h2>

        <form onSubmit={handlePublish} className="space-y-4 text-xs font-mono">
          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Judul Materi
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="misal: Standar Agentic Workflow dengan Hermes & MCP"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Target Divisi
            </label>
            <select
              value={formData.division}
              onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            >
              <option value="all">Semua Divisi (General)</option>
              <option value="builder">Khusus Builder</option>
              <option value="creative">Khusus Creative</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Tautan Resource / Dokumen (PDF, GDrive, Notion, Repo)
            </label>
            <input
              type="url"
              required
              value={formData.resourceUrl}
              onChange={(e) => setFormData({ ...formData, resourceUrl: e.target.value })}
              placeholder="https://drive.google.com/... atau link PDF/Notion"
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Cover Image URL (Opsional)
            </label>
            <input
              type="url"
              value={formData.coverUrl}
              onChange={(e) => setFormData({ ...formData, coverUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-slate-300 mb-1 font-sans font-medium text-xs">
              Ringkasan Materi
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Deskripsi singkat topik materi..."
              className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-white focus:border-muara-cyan focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-muara-cyan hover:bg-muara-cyan-light py-2.5 font-sans font-bold text-background transition-all disabled:opacity-50"
          >
            {loading ? "Menerbitkan..." : "Terbitkan Materi"}
          </button>
        </form>
      </div>

      {/* Reader Audit Table */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 flex flex-col justify-between">
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Icon name="visibility" className="w-5 h-5 text-amber-400" />
            Audit Pembaca (Siapa Saja yang Membuka)
          </h2>

          {initialReads.length === 0 ? (
            <div className="text-slate-500 text-xs font-mono py-8 text-center">
              Belum ada riwayat klik/baca materi.
            </div>
          ) : (
            <div className="overflow-x-auto max-h-[480px]">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-border text-slate-500 uppercase">
                    <th className="py-2 px-2">Member</th>
                    <th className="py-2 px-2">Materi</th>
                    <th className="py-2 px-2 text-right">Waktu Server</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 text-slate-300">
                  {initialReads.map((r) => {
                    const material = materials.find((m) => m.id === r.material_id);
                    return (
                      <tr key={r.id} className="hover:bg-background/40">
                        <td className="py-2.5 px-2">
                          <div className="font-bold text-white">
                            {r.members?.full_name || "Member"}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            @{r.members?.github_username || "-"}
                          </div>
                        </td>
                        <td className="py-2.5 px-2 max-w-[150px] truncate text-slate-400">
                          {material?.title || "Materi"}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-500 text-[11px]">
                          {new Date(r.opened_at).toLocaleString("id-ID")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
