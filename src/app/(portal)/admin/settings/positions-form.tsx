"use client";

import React, { useState } from "react";
import { updatePositions } from "@/app/actions/admin";
import type { PositionsConfig } from "@/lib/positions";

const toLines = (list: string[]) => list.join("\n");
const fromLines = (text: string) =>
  text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

type Message = { tone: "success" | "error"; text: string };

export default function PositionsForm({ initial }: { initial: PositionsConfig }) {
  const [builder, setBuilder] = useState(toLines(initial.builder));
  const [creative, setCreative] = useState(toLines(initial.creative));
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    const result = await updatePositions({ builder: fromLines(builder), creative: fromLines(creative) });
    setSaving(false);
    setMessage(
      result.success
        ? { tone: "success", text: "Posisi tersimpan." }
        : { tone: "error", text: result.error ?? "Gagal menyimpan posisi." }
    );
  };

  return (
    <form onSubmit={save} className="px-card bg-white p-6 sm:p-8 space-y-5">
      <p className="text-sm text-secondary">
        Daftar posisi yang bisa dipilih pendaftar. Tulis satu posisi per baris. Mengubah daftar ini tidak mengubah posisi anggota yang sudah ada.
      </p>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="positions-builder" className="mb-1.5 block text-sm font-medium text-foreground">Posisi Builder (satu per baris)</label>
          <textarea
            id="positions-builder"
            rows={9}
            value={builder}
            onChange={(event) => setBuilder(event.target.value)}
            className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white"
          />
        </div>
        <div>
          <label htmlFor="positions-creative" className="mb-1.5 block text-sm font-medium text-foreground">Posisi Creative (satu per baris)</label>
          <textarea
            id="positions-creative"
            rows={9}
            value={creative}
            onChange={(event) => setCreative(event.target.value)}
            className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white"
          />
        </div>
      </div>
      {message && (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={message.tone === "error" ? "text-sm text-rose-800" : "text-sm text-emerald-800"}
        >
          {message.text}
        </p>
      )}
      <button
        type="submit"
        disabled={saving}
        className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
