"use client";

import React, { useState } from "react";
import { generateRawKey, sha256Hex, keyPrefixOf, KeyPrefixType } from "@/lib/keys";
import { saveApiKey, revokeApiKey, VaultProject } from "@/app/actions/vault";
import Icon from "@/components/ui/icon";

export interface KeyItem {
  id: string;
  name: string;
  key_prefix: string;
  is_active: boolean;
  created_at: string;
  last_used_at?: string | null;
  nim?: string | null;
}

interface VaultClientProps {
  initialAiKeys: KeyItem[];
  initialUbsiKeys: KeyItem[];
}

export default function VaultClient({
  initialAiKeys,
  initialUbsiKeys,
}: VaultClientProps) {
  const [activeTab, setActiveTab] = useState<VaultProject>("ai");
  const [aiKeys, setAiKeys] = useState<KeyItem[]>(initialAiKeys);
  const [ubsiKeys, setUbsiKeys] = useState<KeyItem[]>(initialUbsiKeys);

  const [keyName, setKeyName] = useState("Default Key");
  const [nim, setNim] = useState("");
  const [studentv2Pass, setStudentv2Pass] = useState("");
  const [elearningPass, setElearningPass] = useState("");
  const [loading, setLoading] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);

  // View-once modal state
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const currentKeys = activeTab === "ai" ? aiKeys : ubsiKeys;

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const prefix: KeyPrefixType = activeTab === "ai" ? "muara_ai_" : "muara_ubsi_";
      const rawKey = generateRawKey(prefix);
      const keyHash = await sha256Hex(rawKey);
      const keyPrefix = keyPrefixOf(rawKey, 16);

      const res = await saveApiKey({
        project: activeTab,
        name: keyName,
        keyPrefix,
        keyHash,
        nim: activeTab === "ubsi" ? nim : undefined,
        studentv2Pass: activeTab === "ubsi" ? studentv2Pass : undefined,
        elearningPass: activeTab === "ubsi" ? elearningPass : undefined,
      });

      setLoading(false);

      if (res.success) {
        setGeneratedKey(rawKey);
        setCopied(false);
        // Refresh local list state
        const newKeyItem: KeyItem = {
          id: Math.random().toString(),
          name: keyName,
          key_prefix: keyPrefix,
          is_active: true,
          created_at: new Date().toISOString(),
          nim: activeTab === "ubsi" ? nim : undefined,
        };

        if (activeTab === "ai") {
          setAiKeys((prev) => [newKeyItem, ...prev.map((k) => ({ ...k, is_active: false }))]);
        } else {
          setUbsiKeys((prev) => [newKeyItem, ...prev.map((k) => ({ ...k, is_active: false }))]);
        }
      } else {
        alert(`Gagal membuat key: ${res.error}`);
      }
    } catch (err: any) {
      setLoading(false);
      alert(`Error: ${err.message}`);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Revoke / nonaktifkan API key ini? Kunci yang dicabut tidak dapat digunakan lagi.")) return;
    setRevokingId(keyId);
    const res = await revokeApiKey(activeTab, keyId);
    setRevokingId(null);

    if (res.success) {
      if (activeTab === "ai") {
        setAiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)));
      } else {
        setUbsiKeys((prev) => prev.map((k) => (k.id === keyId ? { ...k, is_active: false } : k)));
      }
    } else {
      alert(`Gagal mencabut key: ${res.error}`);
    }
  };

  const copyToClipboard = () => {
    if (!generatedKey) return;
    navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* View-Once Modal */}
      {generatedKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="rounded-xl border border-teal-200 bg-white p-6 sm:p-8 max-w-lg w-full shadow-ocean-lg space-y-5">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50 text-teal-800 border border-teal-200">
                <Icon name="lock" className="w-5 h-5 text-teal-700" />
              </span>
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">API Key Berhasil Dibuat</h3>
                <p className="text-xs text-slate-500">Kunci ini hanya ditampilkan satu kali demi keamanan.</p>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-border-ocean">
              <div className="text-[10px] font-mono text-slate-500 uppercase mb-1">Kunci Rahasia Plaintext:</div>
              <div className="font-mono text-xs text-slate-900 break-all select-all font-semibold bg-white p-2.5 rounded border border-border">
                {generatedKey}
              </div>
            </div>

            <div className="text-xs text-amber-800 bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
              <Icon name="warning" className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>
                Simpan kunci ini di file <code>.env</code> Anda sekarang. Server Muara AI hanya menyimpan hash SHA-256 dan tidak pernah menyimpan teks asli kunci Anda!
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={copyToClipboard}
                className="inline-flex items-center gap-1.5 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-4 py-2 text-xs font-mono font-bold transition-colors"
              >
                <Icon name={copied ? "check" : "upload_file"} className="w-4 h-4 text-white" />
                {copied ? "Berhasil Disalin!" : "Salin Kunci"}
              </button>
              <button
                type="button"
                onClick={() => setGeneratedKey(null)}
                className="rounded-lg border border-border bg-white hover:bg-surface-alt px-4 py-2 text-xs font-mono text-slate-600 transition-colors"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Project Selector Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-surface-alt rounded-lg border border-border-ocean w-fit">
        <button
          type="button"
          onClick={() => setActiveTab("ai")}
          className={`px-4 py-2 rounded-md text-xs font-mono transition-colors flex items-center gap-2 ${
            activeTab === "ai"
              ? "bg-muara-ocean text-white font-bold shadow-sm"
              : "text-slate-600 hover:text-foreground hover:bg-white"
          }`}
        >
          <Icon name="hub" className="w-4 h-4" />
          Muara AI Gateway (muara_ai_)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("ubsi")}
          className={`px-4 py-2 rounded-md text-xs font-mono transition-colors flex items-center gap-2 ${
            activeTab === "ubsi"
              ? "bg-muara-ocean text-white font-bold shadow-sm"
              : "text-slate-600 hover:text-foreground hover:bg-white"
          }`}
        >
          <Icon name="terminal" className="w-4 h-4" />
          UBSI API (muara_ubsi_)
        </button>
      </div>

      {/* Key Generator Panel */}
      <div className="rounded-xl border border-border-ocean bg-white p-6 sm:p-8 shadow-ocean">
        <h2 className="font-display font-bold text-lg text-foreground mb-1 flex items-center gap-2">
          <Icon name="lock" className="w-5 h-5 text-muara-ocean" />
          Generate API Key Baru — {activeTab === "ai" ? "Muara AI Gateway" : "UBSI API"}
        </h2>
        <p className="text-xs text-slate-500 mb-6">
          Kunci di-generate langsung dengan WebCrypto di browser dan disimpan sebagai SHA-256 hash. Kunci lama akan otomatis dinonaktifkan saat membuat kunci baru.
        </p>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className={activeTab === "ubsi" ? "sm:col-span-3" : "sm:col-span-2"}>
            <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
              Label Kunci (Nama Perangkat / Lingkungan)
            </label>
            <input
              type="text"
              required
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              placeholder="misal: Laptop Pribadi, VPS Staging"
              className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
            />
          </div>

          {activeTab === "ubsi" && (
            <>
              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  NIM Mahasiswa
                </label>
                <input
                  type="text"
                  required
                  value={nim}
                  onChange={(e) => setNim(e.target.value)}
                  placeholder="15260767"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Password SIAKAD (StudentV2)
                </label>
                <input
                  type="password"
                  required
                  value={studentv2Pass}
                  onChange={(e) => setStudentv2Pass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 mb-1 font-sans font-medium text-xs">
                  Password MyBest (Elearning)
                </label>
                <input
                  type="password"
                  required
                  value={elearningPass}
                  onChange={(e) => setElearningPass(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-border bg-slate-50 px-3.5 py-2.5 text-foreground focus:border-muara-ocean focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-3 text-[11px] font-sans text-slate-500 bg-sky-50 border border-sky-200/60 p-3 rounded-lg flex items-start gap-2">
                <Icon name="lock" className="w-4 h-4 text-muara-ocean shrink-0 mt-0.5" />
                <span>
                  Kredensial kampus Anda diverifikasi langsung ke server UBSI, dienkripsi menggunakan standar militer <strong>AES-256-GCM</strong> sebelum disimpan ke vault, dan hanya dapat didekripsi oleh scraper terisolasi di VPS.
                </span>
              </div>
            </>
          )}

          <div className="sm:col-span-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-5 py-2.5 text-xs font-bold transition-all shadow-sm disabled:opacity-50"
            >
              <Icon name="lock" className="w-4 h-4 text-white" />
              {loading ? "Memproses Kunci..." : "Generate API Key"}
            </button>
          </div>
        </form>
      </div>

      {/* Key List Table */}
      <div className="rounded-xl border border-border-ocean bg-white p-6 sm:p-8 shadow-ocean">
        <h3 className="font-display font-bold text-base text-foreground mb-4">
          Daftar Kunci Aktif & Riwayat ({currentKeys.length})
        </h3>

        {currentKeys.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs font-mono bg-surface-alt/40 rounded-lg border border-dashed border-border-ocean">
            Belum ada API key yang dibuat untuk proyek ini.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-border text-slate-500 uppercase">
                  <th className="py-2.5 px-3">Label</th>
                  <th className="py-2.5 px-3">Key Prefix</th>
                  <th className="py-2.5 px-3">Tanggal Dibuat</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                  <th className="py-2.5 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-slate-700">
                {currentKeys.map((k) => (
                  <tr key={k.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 font-bold text-foreground">{k.name}</td>
                    <td className="py-3 px-3 text-slate-500 font-semibold">{k.key_prefix}...</td>
                    <td className="py-3 px-3 text-slate-500">
                      {new Date(k.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                          k.is_active
                            ? "bg-teal-50 text-teal-800 border border-teal-200"
                            : "bg-slate-100 text-slate-500 border border-border"
                        }`}
                      >
                        {k.is_active ? "Aktif" : "Revoked"}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {k.is_active ? (
                        <button
                          type="button"
                          disabled={revokingId === k.id}
                          onClick={() => handleRevoke(k.id)}
                          className="rounded border border-rose-200 text-rose-700 hover:bg-rose-50 px-3 py-1 text-[11px] font-bold transition-colors disabled:opacity-50"
                        >
                          {revokingId === k.id ? "..." : "Revoke"}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
