"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Achievement } from "@/types/database";
import Icon from "@/components/ui/icon";

interface AccoladesGridProps {
  initialAchievements?: Achievement[];
}

export default function AccoladesGrid({ initialAchievements = [] }: AccoladesGridProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section id="accolades" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-border bg-white">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-muara-ocean mb-2">
              Sertifikat & Rekognisi
            </h2>
            <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              The Accolades (Prestasi Resmi)
            </p>
          </div>
          <p className="text-sm text-slate-600 max-w-md">
            Arsip kredensial, kejuaraan hackathon, dan sertifikasi profesional anggota yang dapat diverifikasi secara publik.
          </p>
        </div>

        {initialAchievements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border-ocean p-12 text-center text-slate-500 text-sm bg-surface-alt/40 flex flex-col items-center">
            <Icon name="workspace_premium" className="w-10 h-10 text-muara-ocean mb-2" />
            Arsip prestasi dan sertifikat kompetisi sedang dalam tahap kurasi kurikulum semester 1.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialAchievements.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-border-ocean bg-white overflow-hidden group hover:border-muara-ocean transition-all shadow-ocean flex flex-col justify-between"
              >
                <div>
                  {/* Certificate Image Preview */}
                  <div
                    onClick={() => setActiveImage(item.image_url)}
                    className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-zoom-in"
                  >
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-60" />
                    <span className="absolute bottom-2 right-2 rounded bg-white/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 border border-border shadow-sm">
                      Klik untuk perbesar
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-2">
                      <span className="text-muara-ocean font-bold">{item.issuer}</span>
                      <span>{item.issue_date}</span>
                    </div>

                    <h3 className="font-display font-bold text-base text-foreground group-hover:text-muara-ocean transition-colors mb-3">
                      {item.title}
                    </h3>

                    {item.recipient_names?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.recipient_names.map((name, nIdx) => (
                          <span
                            key={nIdx}
                            className="rounded bg-surface-alt border border-border-ocean px-2 py-0.5 text-[10px] font-mono text-slate-700"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {item.credential_url && (
                  <div className="px-5 pb-5 pt-0">
                    <Link
                      href={item.credential_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-muara-ocean hover:text-muara-ocean-dark hover:underline"
                    >
                      <Icon name="verified" className="w-4 h-4 text-muara-ocean" />
                      Verifikasi Kredensial
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
              <Image
                src={activeImage}
                alt="Certificate Detail"
                fill
                className="object-contain rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
