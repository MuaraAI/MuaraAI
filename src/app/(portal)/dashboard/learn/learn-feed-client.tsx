"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LearningMaterial } from "@/types/database";
import { recordMaterialRead } from "@/app/actions/learn";

interface LearnFeedClientProps {
  initialMaterials: LearningMaterial[];
}

export default function LearnFeedClient({ initialMaterials }: LearnFeedClientProps) {
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const handleOpenMaterial = async (m: LearningMaterial) => {
    setReadIds((prev) => new Set(prev).add(m.id));
    // Trigger server action to record read event
    await recordMaterialRead(m.id);
    // Open in new tab
    window.open(m.resource_url, "_blank", "noopener,noreferrer");
  };

  if (initialMaterials.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-12 text-center text-slate-500 text-xs font-mono">
        Belum ada materi pembelajaran yang diterbitkan.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {initialMaterials.map((m) => {
        const isOpened = readIds.has(m.id);
        return (
          <div
            key={m.id}
            className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between hover:border-muara-cyan/40 transition-colors shadow-md"
          >
            <div>
              {m.cover_url && (
                <div className="relative h-40 w-full mb-4 rounded-lg overflow-hidden bg-background">
                  <Image src={m.cover_url} alt={m.title} fill className="object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-muara-cyan/10 border border-muara-cyan/30 px-2 py-0.5 text-[10px] font-mono text-muara-cyan uppercase font-bold">
                  {m.division}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(m.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-white mb-2">{m.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-6 whitespace-pre-wrap">
                {m.description}
              </p>
            </div>

            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenMaterial(m)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-surface-hover hover:bg-muara-cyan hover:text-background border border-border px-3.5 py-2 text-xs font-mono font-semibold text-slate-200 transition-colors"
              >
                <span className="material-symbols-rounded text-sm">open_in_new</span>
                Buka Materi
              </button>

              {isOpened && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="material-symbols-rounded text-xs">check</span>
                  Sudah Dibuka
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
