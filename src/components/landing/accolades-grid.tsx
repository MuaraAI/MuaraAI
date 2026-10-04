"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Achievement } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";

interface AccoladesGridProps {
  initialAchievements?: Achievement[];
}

export default function AccoladesGrid({ initialAchievements = [] }: AccoladesGridProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <section id="accolades" className="py-20 px-4 sm:px-6 lg:px-8 border-b border-stroke bg-white">
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
          <p className="text-sm text-secondary max-w-md font-sans">
            Arsip kredensial, kejuaraan hackathon, dan sertifikasi profesional anggota yang dapat diverifikasi secara publik.
          </p>
        </div>

        {initialAchievements.length === 0 ? (
          <div className="rounded-[18px] border border-dashed border-stroke p-12 text-center text-secondary text-sm bg-surface-alt flex flex-col items-center">
            <Icon name="workspace_premium" className="w-10 h-10 text-muara-ocean mb-2" />
            Arsip prestasi dan sertifikat kompetisi sedang dalam tahap kurasi kurikulum semester 1.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {initialAchievements.map((item, idx) => (
              <FadeIn key={item.id} delay={idx * 0.1}>
                <div
                  className="rounded-[18px] border border-stroke bg-white overflow-hidden group hover:border-muara-ocean transition-all shadow-diffusion hover:shadow-lift flex flex-col justify-between h-full"
                >
                  <div>
                    {/* Certificate Image Preview */}
                    <div
                      role="button"
                      tabIndex={0}
                      aria-label={`Perbesar gambar sertifikat ${item.title}`}
                      onClick={() => setActiveImage(item.image_url)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setActiveImage(item.image_url);
                        }
                      }}
                      className="relative h-48 w-full bg-slate-100 overflow-hidden cursor-zoom-in"
                    >
                      <Image
                        src={item.image_url}
                        alt={item.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent opacity-60" />
                      <span className="absolute bottom-2 right-2 rounded-[6px] bg-white/90 px-2 py-0.5 text-[10px] font-mono text-slate-700 border border-stroke shadow-xs">
                        Klik untuk perbesar
                      </span>
                    </div>

                    <div className="p-5">
                      <div className="flex items-center justify-between text-xs font-mono text-secondary mb-2">
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
                              className="rounded-[6px] bg-surface-alt border border-stroke px-2 py-0.5 text-[10px] font-mono text-slate-700"
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-muara-ocean hover:text-muara-ocean-dark hover:underline font-mono"
                      >
                        <Icon name="verified" className="w-4 h-4 text-muara-ocean" />
                        <span>Verifikasi Kredensial</span>
                      </Link>
                    </div>
                  )}
                </div>
              </FadeIn>
            ))}
          </div>
        )}

        {/* Lightbox Modal */}
        {activeImage && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Tampilan Penuh Sertifikat"
            onClick={() => setActiveImage(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 cursor-zoom-out"
          >
            <div className="relative max-w-4xl max-h-[85vh] w-full h-full">
              <Image
                src={activeImage}
                alt="Certificate Detail"
                fill
                className="object-contain rounded-[18px]"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
