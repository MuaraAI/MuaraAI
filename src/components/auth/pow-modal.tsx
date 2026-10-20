"use client";

import React, { useEffect, useState } from "react"; import Link from "next/link";
import { submitProofOfWork } from "@/app/actions/pow";
import { PoWInput } from "@/lib/validation";
import Icon from "@/components/ui/icon";
import campusesData from "@/data/campuses.json";
import PixelSelect from "@/components/ui/pixel-select";

type Step = 0 | 1 | 2 | 3;

const steps = ["Identitas kampus", "Proof of Work", "Profil publik", "Review"];

export default function PoWForm({
  authenticated = false,
  githubUsername,
  initialData,
  rejectionReason,
}: {
  authenticated?: boolean;
  githubUsername?: string;
  initialData?: Partial<PoWInput>;
  rejectionReason?: string;
}) {
  const [step, setStep] = useState<Step>(0);
  const [formData, setFormData] = useState<PoWInput>({
    fullName: initialData?.fullName || "",
    nim: initialData?.nim || "",
    campus: initialData?.campus || "",
    prodi: initialData?.prodi || "",
    kelas: initialData?.kelas || "",
    phoneWa: initialData?.phoneWa || "",
    division: initialData?.division || "builder",
    track: initialData?.track || "Full-stack Web & AI App",
    toolchainNarrative: initialData?.toolchainNarrative || "",
    portfolioUrl: initialData?.portfolioUrl || "",
    websiteUrl: initialData?.websiteUrl || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    instagramUrl: initialData?.instagramUrl || "",
    threadsUrl: initialData?.threadsUrl || "",
    xUrl: initialData?.xUrl || "",
  });
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authenticated || typeof window === "undefined" || !window.localStorage) return;
    const draft = window.localStorage.getItem("muaraai_onboarding_draft");
    if (draft) {
      try {
        const parsed = JSON.parse(draft) as PoWInput;
        setFormData(parsed);
        if (parsed.fullName && parsed.nim && parsed.campus && parsed.portfolioUrl) {
          setStep(3);
          setAgreed(true);
        }
      } catch {
        window.localStorage.removeItem("muaraai_onboarding_draft");
      }
    }
  }, [authenticated]);

  const update = <K extends keyof PoWInput>(key: K, value: PoWInput[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const next = () => setStep((current) => Math.min(3, current + 1) as Step);
  const previous = () => setStep((current) => Math.max(0, current - 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError("Setujui Privacy Policy, Terms of Service, dan Code of Conduct sebelum lanjut.");
      return;
    }
    setError(null);
    if (!authenticated) {
      window.localStorage.setItem("muaraai_onboarding_draft", JSON.stringify(formData));
      window.location.href = "/api/auth/login?next=/onboarding";
      return;
    }
    setLoading(true);
    const result = await submitProofOfWork(formData);
    setLoading(false);
    if (result.success) {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem("muaraai_onboarding_draft");
      }
      window.location.href = "/dashboard";
      return;
    }
    setError(result.error || "Gagal mengirimkan Proof of Work.");
  };

  if (success) {
    return (
      <div className="px-card bg-white p-8 text-center max-w-lg mx-auto">
        <Icon name="check_circle" className="w-12 h-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="font-display text-2xl font-bold text-foreground mb-2">Proof of Work Terkirim!</h2>
        <p className="text-sm text-secondary leading-relaxed mb-6">Data kamu sudah diterima dan akan ditinjau oleh Core Team MuaraAI.</p>
        <a href="/" className="px-btn inline-flex min-h-11 items-center px-6 py-2.5 text-sm font-semibold">Kembali ke Beranda</a>
      </div>
    );
  }

  return (
    <div className="px-card bg-white p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.14em] text-muara-ocean">Pendaftaran MuaraAI 2026+</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-foreground">Buat profil komunitasmu</h2>
        <p className="mt-2 text-sm text-secondary">Selesaikan empat langkah singkat. Draft kamu tetap tersimpan saat berpindah langkah.</p>
      </div>

      {rejectionReason && (
        <div className="px-frame [--px-line:#FCD34D] mb-6 bg-amber-50/80 p-4 text-xs text-amber-950 flex items-start gap-3">
          <Icon name="info" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-900">Catatan Review Sebelumnya</div>
            <p className="text-secondary leading-relaxed">
              &quot;{rejectionReason}&quot;
            </p>
            <p className="text-amber-800 font-medium pt-1">
              Data pendaftaran sebelumnya telah dimuat. Silakan perbaiki hal-hal yang kurang lalu kirim permohonan baru.
            </p>
          </div>
        </div>
      )}

      {authenticated && (
        <div className="px-frame [--px-line:#7DD3FC] mb-8 bg-sky-50/80 p-4 text-xs text-sky-900 flex items-start gap-3">
          <Icon name="check_circle" className="w-5 h-5 text-muara-ocean shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-foreground">
              Akun GitHub Terhubung {githubUsername ? <span className="font-mono text-muara-ocean">(@{githubUsername})</span> : null}
            </div>
            <p className="text-secondary leading-relaxed">
              Anda sudah masuk via GitHub. Silakan lengkapi data profil dan Proof of Work di bawah ini untuk mengirim permohonan ke Core Team.
            </p>
          </div>
        </div>
      )}

      <ol aria-label="Progress pendaftaran" className="mb-8 grid grid-cols-4 gap-2">
        {steps.map((label, index) => (
          <li key={label} className={`border-t-2 pt-2 text-[11px] font-medium ${index <= step ? "border-muara-ocean text-foreground" : "border-stroke text-secondary"}`}>
            <span className="block">{index + 1}. {label}</span>
          </li>
        ))}
      </ol>

      {error && <div role="alert" className="px-frame [--px-line:#FDA4AF] mb-6 bg-rose-50 p-3.5 text-sm text-rose-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 0 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">Identitas kampus</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fullName" label="Nama Lengkap" value={formData.fullName} onChange={(value) => update("fullName", value)} required />
              <Field id="phoneWa" label="WhatsApp / Kontak Aktif" value={formData.phoneWa} onChange={(value) => update("phoneWa", value)} required />
              <Field id="nim" label="NIM mahasiswa" value={formData.nim} onChange={(value) => update("nim", value.replace(/\D/g, ""))} required maxLength={16} placeholder="Sesuai kartu tanda mahasiswa kampus Anda" />
              <Field id="kelas" label="Kode Kelas (opsional)" value={formData.kelas || ""} onChange={(value) => update("kelas", value.toUpperCase())} placeholder="Untuk mahasiswa UBSI, misal: 15.1C.30" />
              <Field id="campus" label="Kampus / institusi asal" value={formData.campus} onChange={(value) => update("campus", value)} required placeholder="Ketik atau pilih kampus Anda" list="campuses-list" />
              <datalist id="campuses-list">
                {campusesData.map((c) => (
                  <option key={c.name} value={c.name}>{c.city}</option>
                ))}
              </datalist>
              <Field id="prodi" label="Program Studi" value={formData.prodi} onChange={(value) => update("prodi", value)} required placeholder="Contoh: Informatika (S1)" />
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">Proof of Work</legend>
            <Field id="portfolioUrl" label="Tautan Repositori atau Portofolio" value={formData.portfolioUrl} onChange={(value) => update("portfolioUrl", value)} required type="url" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField id="division" label="Divisi Pilihan" value={formData.division} options={["builder", "creative"]} onChange={(value) => update("division", value as "builder" | "creative")} />
              <Field id="track" label="Track Spesialisasi" value={formData.track} onChange={(value) => update("track", value)} required />
            </div>
            <TextAreaField id="toolchainNarrative" label="Toolchain dan workflow yang dikuasai" value={formData.toolchainNarrative} onChange={(value) => update("toolchainNarrative", value)} required />
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">Profil publik</legend>
            <p className="text-sm text-secondary">Semua field di sini opsional. Isi yang ingin kamu tampilkan di profil anggota.</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="websiteUrl" label="Website pribadi" value={formData.websiteUrl || ""} onChange={(value) => update("websiteUrl", value)} type="url" />
              <Field id="linkedinUrl" label="LinkedIn" value={formData.linkedinUrl || ""} onChange={(value) => update("linkedinUrl", value)} type="url" />
              <Field id="instagramUrl" label="Instagram" value={formData.instagramUrl || ""} onChange={(value) => update("instagramUrl", value)} />
              <Field id="xUrl" label="X / Twitter" value={formData.xUrl || ""} onChange={(value) => update("xUrl", value)} />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">Review pendaftaran</legend>
            <div className="px-frame [--px-line:#CFE2EE] divide-y divide-stroke bg-surface-alt text-sm">
              <Summary label="Nama" value={formData.fullName} />
              <Summary label="Kampus" value={[formData.campus, formData.prodi, formData.kelas].filter(Boolean).join(" · ")} />
              <Summary label="Proof of Work" value={formData.portfolioUrl} />
              <Summary label="Divisi" value={`${formData.division} · ${formData.track}`} />
            </div>
            <p className="text-xs leading-relaxed text-secondary">Dengan mengirim formulir, kamu menyatakan data kampus dan karya yang dikirim benar serta bersedia mengikuti proses review komunitas.</p>
          </fieldset>
        )}

        {step === 3 && (
          <label className="px-frame [--px-line:#CFE2EE] flex items-start gap-3 bg-surface-alt p-4 text-xs leading-relaxed text-secondary">
            <input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); setError(null); }} className="mt-0.5 h-4 w-4 shrink-0 accent-muara-ocean" />
            <span>Saya menyetujui <Link href="/privacy" target="_blank" className="font-semibold text-muara-ocean underline">Privacy Policy</Link>, <Link href="/terms" target="_blank" className="font-semibold text-muara-ocean underline">Terms of Service</Link>, dan <Link href="/code-of-conduct" target="_blank" className="font-semibold text-muara-ocean underline">Code of Conduct</Link> MuaraAI.</span>
          </label>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-stroke pt-5 sm:flex-row sm:justify-between">
          <button type="button" onClick={previous} disabled={step === 0} className="px-btn-ghost [--px-off:3px] min-h-11 px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-40">Kembali</button>
          {step < 3 ? (
            <button type="button" onClick={next} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold">Lanjut</button>
          ) : (
            <button type="submit" disabled={loading || !agreed} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{authenticated ? (loading ? "Mengirim..." : "Kirim pendaftaran") : "Lanjut ke GitHub"}</button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, required = false, type = "text", maxLength, placeholder, list }: { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; maxLength?: number; placeholder?: string; list?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label><input id={id} type={type} list={list} value={value} placeholder={placeholder} required={required} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white" /></div>;
}

function SelectField({ id, label, value, options, onChange }: { id: string; label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label} *</label><PixelSelect id={id} value={value} onChange={onChange} options={options.map((option) => ({ value: option, label: option.charAt(0).toUpperCase() + option.slice(1) }))} /></div>;
}

function TextAreaField({ id, label, value, onChange, required }: { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label><textarea id={id} value={value} required={required} rows={4} onChange={(event) => onChange(event.target.value)} className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white" /></div>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr]"><dt className="font-medium text-secondary">{label}</dt><dd className="break-words text-foreground">{value || "Belum diisi"}</dd></div>;
}
