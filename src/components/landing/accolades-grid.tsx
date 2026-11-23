"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Achievement } from "@/types/database";
import Icon from "@/components/ui/icon";
import FadeIn from "@/components/ui/fade-in";
import { Section, SectionHeader } from "@/components/ui/section";

interface AccoladesGridProps {
  initialAchievements?: Achievement[];
}

export default function AccoladesGrid({ initialAchievements = [] }: AccoladesGridProps) {
  const [activeImage, setActiveImage] = useState<string | null>(null);

  return (
    <Section id="accolades" tone="white">
      <SectionHeader
        eyebrow="Sertifikat & Rekognisi"
        title="Prestasi & rekognisi anggota"
        description="Arsip kredensial, kejuaraan hackathon, dan sertifikasi profesional anggota yang dapat diverifikasi secara publik."
      />

        {initialAchievements.length === 0 ? (
          <FadeIn className="p-[2px]">
            <div className="flex flex-col items-center border-2 border-dashed border-[#CFE2EE] bg-surface-alt/60 px-6 py-14 text-center">
              <span className="px-icon mb-5 h-14 w-14">
                <Icon name="workspace_premium" className="h-7 w-7" />
              </span>
              <p className="font-display text-lg font-bold text-foreground">Arsip prestasi segera hadir</p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-secondary">
                Arsip prestasi dan sertifikat kompetisi sedang dalam tahap kurasi kurikulum semester 1.
              </p>
            </div>
          </FadeIn>
        ) : (
          <div className="rail grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {initialAchievements.map((item, idx) => (
              <FadeIn key={item.id} delay={(idx % 3) * 0.1} className="h-full p-[2px]">
                <div
                  className="px-card px-card-hover bg-white group flex flex-col justify-between h-full"
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
                      <span className="px-chip absolute bottom-2 right-2 bg-white/90 px-2 py-0.5 text-[10px] font-mono text-slate-700">
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
                              className="px-chip bg-surface-alt px-2 py-0.5 text-[10px] font-mono text-slate-700"
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
                className="object-contain"
              />
            </div>
          </div>
        )}
    </Section>
  );
}
