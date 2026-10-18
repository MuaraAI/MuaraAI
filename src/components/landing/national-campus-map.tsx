"use client";

import React from "react";
import { useReducedMotion } from "motion/react";

const points = {
  pontianak: [34, 34],
  jakarta: [48, 58],
  depok: [50, 62],
  yogyakarta: [58, 70],
} as const;

export default function NationalCampusMap() {
  const reducedMotion = useReducedMotion();
  const hub = points.pontianak;
  const routes = [points.jakarta, points.depok, points.yogyakarta];

  return (
    <section className="border-b border-stroke bg-white px-4 py-20 sm:px-6 lg:px-8" aria-labelledby="campus-map-title">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
        <div>
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-muara-ocean">DARI LOKAL KE NASIONAL</p>
          <h2 id="campus-map-title" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Satu arus, banyak kampus.</h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-secondary">MuaraAI lahir di UBSI Pontianak dan terbuka untuk mahasiswa UBSI dari seluruh Indonesia, mulai angkatan 2026.</p>
          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-start gap-3"><span className="mt-1 h-3 w-3 rounded-full bg-muara-ocean" /><span><strong className="text-foreground">Founding hub</strong><br /><span className="text-secondary">Pontianak, pusat awal dan pertemuan offline.</span></span></div>
            <div className="flex items-start gap-3"><span className="mt-1 h-3 w-3 rounded-full bg-amber-500" /><span><strong className="text-foreground">Regional hub</strong><br /><span className="text-secondary">Jakarta, titik koneksi regional.</span></span></div>
          </div>
        </div>
        <figure role="img" aria-label="Peta kampus UBSI seluruh Indonesia. Rute komunitas mengarah ke UBSI Pontianak sebagai founding hub, dengan UBSI Jakarta sebagai regional hub." className="relative aspect-[1.8] overflow-hidden rounded-xl border border-stroke bg-surface-alt p-4">
          <svg viewBox="0 0 100 100" className="h-full w-full" aria-hidden="true">
            <path d="M8 38 C22 24, 34 22, 48 28 C62 34, 76 29, 93 39 M18 56 C32 47, 43 51, 58 60 C70 67, 83 62, 94 53 M28 75 C42 68, 53 72, 68 78 C78 82, 88 78, 94 70" fill="none" stroke="#D9E5ED" strokeWidth="1" strokeDasharray="2 2" />
            {routes.map(([x, y], index) => <path key={index} data-route d={`M${x} ${y} Q${(x + hub[0]) / 2} ${(y + hub[1]) / 2 - 10} ${hub[0]} ${hub[1]}`} fill="none" stroke="#0369A1" strokeWidth="0.8" pathLength="1" className={reducedMotion ? "" : "national-map-route"} style={{ animationDelay: `${index * 180}ms` }} />)}
            <circle cx={hub[0]} cy={hub[1]} r="4.5" fill="#0369A1" />
            <circle cx={hub[0]} cy={hub[1]} r="8" fill="none" stroke="#0369A1" strokeWidth="0.8" className={reducedMotion ? "" : "national-map-ring"} />
            <circle cx={points.jakarta[0]} cy={points.jakarta[1]} r="3" fill="#D97706" />
            <circle cx={points.depok[0]} cy={points.depok[1]} r="2" fill="#3B5A70" />
            <circle cx={points.yogyakarta[0]} cy={points.yogyakarta[1]} r="2" fill="#3B5A70" />
          </svg>
          <span className="absolute left-[27%] top-[25%] rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">UBSI Pontianak</span>
          <span className="absolute left-[44%] top-[57%] rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm">UBSI Jakarta</span>
          <figcaption className="absolute bottom-3 left-4 text-[10px] font-mono uppercase tracking-[0.12em] text-secondary">Jaringan komunitas UBSI</figcaption>
        </figure>
      </div>
    </section>
  );
}
