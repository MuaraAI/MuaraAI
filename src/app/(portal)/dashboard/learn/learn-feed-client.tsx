"use client";

import React, { useState } from "react";
import Image from "next/image";
import { LearningMaterial } from "@/types/database";
import { recordMaterialRead } from "@/app/actions/learn";
import Icon from "@/components/ui/icon";

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
      <div className="border-2 border-dashed border-[#CFE2EE] p-12 text-center text-slate-500 text-xs font-mono">
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
            className="px-card bg-white p-6 flex flex-col justify-between"
          >
            <div>
              {m.cover_url && (
                <div className="relative h-40 w-full mb-4 overflow-hidden bg-background">
                  <Image src={m.cover_url} alt={m.title} fill className="object-cover" />
                </div>
              )}

              <div className="flex items-center gap-2 mb-2">
                <span className="px-chip bg-muara-cyan/10 px-2 py-0.5 text-[10px] font-mono text-muara-cyan uppercase font-bold">
                  {m.division}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {new Date(m.created_at).toLocaleDateString("id-ID")}
                </span>
              </div>

              <h3 className="font-display text-lg font-bold text-foreground mb-2">{m.title}</h3>
              <p className="text-xs text-secondary leading-relaxed mb-6 whitespace-pre-wrap font-sans">
                {m.description}
              </p>
            </div>

            <div className="pt-4 border-t border-stroke flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleOpenMaterial(m)}
                className="px-btn-ghost [--px-off:3px] inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-mono font-semibold text-foreground transition-colors"
              >
                <Icon name="open_in_new" className="w-4 h-4 text-muara-ocean" />
                <span>Buka Materi</span>
              </button>

              {isOpened && (
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <Icon name="check" className="w-3.5 h-3.5 text-emerald-400" />
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
