"use client";

import React, { useState } from "react";
import { updateContributionRules } from "@/app/actions/admin";
import type { ContributionRules, Enforcement } from "@/lib/contributions/rules";

const MODES: { value: Enforcement; label: string }[] = [
  { value: "dry_run", label: "Dry run (hanya mencatat)" },
  { value: "warn_only", label: "Peringatan saja" },
  { value: "full", label: "Penuh (peringatan + kick)" },
];

const toNumber = (value: string) => (value === "" ? 0 : Number(value));
const inputClass = "border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white";

type Message = { tone: "success" | "error"; text: string };

function NumberField({ id, label, value, onChange }: { id: string; label: string; value: number; onChange: (value: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
      <input id={id} type="number" min={0} max={1000} value={value} onChange={(event) => onChange(event.target.value)} className={inputClass} />
    </div>
  );
}

export default function RulesForm({ initial }: { initial: ContributionRules }) {
  const [rules, setRules] = useState<ContributionRules>(initial);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const setBuilder = (key: keyof ContributionRules["builder"], value: string) =>
    setRules((current) => ({ ...current, builder: { ...current.builder, [key]: toNumber(value) } }));
  const setCreative = (key: keyof ContributionRules["creative"], value: string) =>
    setRules((current) => ({ ...current, creative: { ...current.creative, [key]: toNumber(value) } }));

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updateContributionRules(rules);
    setSaving(false);
    setMessage(
      result.success
        ? { tone: "success", text: "Aturan tersimpan." }
        : { tone: "error", text: result.error ?? "Gagal menyimpan aturan." }
    );
  };

  return (
    <form onSubmit={save} className="px-card bg-white p-6 sm:p-8 space-y-6">
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Aturan kontribusi bulanan</h2>
        <p className="mt-1 text-sm text-secondary">
          Target dihitung dari PR yang sudah di-merge dan di-approve orang lain. Evaluasi berjalan untuk bulan yang sudah selesai.
        </p>
      </div>

      <div>
        <label htmlFor="enforcement" className="mb-1.5 block text-sm font-medium text-foreground">Mode penegakan</label>
        <select
          id="enforcement"
          value={rules.enforcement}
          onChange={(event) => setRules((current) => ({ ...current, enforcement: event.target.value as Enforcement }))}
          className={inputClass}
        >
          {MODES.map((mode) => (
            <option key={mode.value} value={mode.value}>{mode.label}</option>
          ))}
        </select>
        {rules.enforcement === "full" && (
          <p role="note" className="mt-2 text-sm text-rose-800">
            Mode full otomatis mengeluarkan anggota yang tidak memenuhi target dua bulan berturut-turut.
          </p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="org" className="mb-1.5 block text-sm font-medium text-foreground">Org GitHub</label>
          <input id="org" value={rules.org} onChange={(event) => setRules((current) => ({ ...current, org: event.target.value }))} className={inputClass} />
        </div>
        <div>
          <label htmlFor="newWorkLabel" className="mb-1.5 block text-sm font-medium text-foreground">Label karya baru</label>
          <input
            id="newWorkLabel"
            value={rules.newWorkLabel}
            onChange={(event) => setRules((current) => ({ ...current, newWorkLabel: event.target.value }))}
            className={inputClass}
          />
        </div>
      </div>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">Builder</legend>
        <div className="grid gap-4 sm:grid-cols-4">
          <NumberField id="builder-mergedPrs" label="Builder: PR ter-merge" value={rules.builder.mergedPrs} onChange={(value) => setBuilder("mergedPrs", value)} />
          <NumberField id="builder-externalPrs" label="Builder: PR di repo orang lain" value={rules.builder.externalPrs} onChange={(value) => setBuilder("externalPrs", value)} />
          <NumberField id="builder-commits" label="Builder: commit" value={rules.builder.commits} onChange={(value) => setBuilder("commits", value)} />
          <NumberField id="builder-newRepos" label="Builder: repo baru" value={rules.builder.newRepos} onChange={(value) => setBuilder("newRepos", value)} />
        </div>
      </fieldset>

      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold text-foreground">Creative</legend>
        <div className="grid gap-4 sm:grid-cols-3">
          <NumberField id="creative-mergedPrs" label="Creative: PR ter-merge" value={rules.creative.mergedPrs} onChange={(value) => setCreative("mergedPrs", value)} />
          <NumberField id="creative-externalPrs" label="Creative: PR di repo orang lain" value={rules.creative.externalPrs} onChange={(value) => setCreative("externalPrs", value)} />
          <NumberField id="creative-newWorks" label="Creative: karya baru" value={rules.creative.newWorks} onChange={(value) => setCreative("newWorks", value)} />
        </div>
      </fieldset>

      {message && (
        <p role={message.tone === "error" ? "alert" : "status"} className={message.tone === "error" ? "text-sm text-rose-800" : "text-sm text-emerald-800"}>
          {message.text}
        </p>
      )}
      <button type="submit" disabled={saving} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">
        {saving ? "Menyimpan..." : "Simpan aturan"}
      </button>
    </form>
  );
}
