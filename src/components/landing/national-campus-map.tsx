"use client";

import React from "react";
import { useReducedMotion } from "motion/react";

const points = { pontianak: [34, 34], jakarta: [48, 58], depok: [50, 62], yogyakarta: [58, 70] } as const;

export default function NationalCampusMap() {
  const reducedMotion = useReducedMotion();
  const hub = points.pontianak;
  const routes = [points.jakarta, points.depok, points.yogyakarta];

  return (
    <figure role="img" aria-label="Peta kampus UBSI seluruh Indonesia. Rute komunitas mengarah ke UBSI Pontianak sebagai founding hub, dengan UBSI Jakarta sebagai regional hub." className="national-campus-map relative aspect-[1.35] w-full overflow-visible bg-transparent">
      <div className="absolute left-0 top-0 text-[10px] font-mono uppercase tracking-[0.16em] text-secondary">Jaringan UBSI nasional</div>
      <div className="absolute left-[27%] top-[25%] z-10 rounded-md bg-muara-ocean px-2.5 py-1.5 text-[10px] font-semibold text-white shadow-diffusion">UBSI Pontianak</div>
      <div className="absolute left-[44%] top-[57%] z-10 rounded-md bg-white px-2 py-1 text-[10px] font-semibold text-foreground shadow-sm ring-1 ring-stroke">UBSI Jakarta</div>
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <path d="M8 38 C22 24, 34 22, 48 28 C62 34, 76 29, 93 39 M18 56 C32 47, 43 51, 58 60 C70 67, 83 62, 94 53 M28 75 C42 68, 53 72, 68 78 C78 82, 88 78, 94 70" fill="none" stroke="#D9E5ED" strokeWidth="1" strokeDasharray="2 2" />
        {routes.map(([x, y], index) => <path key={index} data-route d={`M${x} ${y} Q${(x + hub[0]) / 2} ${(y + hub[1]) / 2 - 10} ${hub[0]} ${hub[1]}`} fill="none" stroke="#0369A1" strokeWidth="0.8" pathLength="1" className={reducedMotion ? "" : "national-map-route"} style={{ animationDelay: `${index * 180}ms` }} />)}
        <circle cx={hub[0]} cy={hub[1]} r="4.5" fill="#0369A1" />
        <circle cx={hub[0]} cy={hub[1]} r="8" fill="none" stroke="#0369A1" strokeWidth="0.8" className={reducedMotion ? "" : "national-map-ring"} />
        <circle cx={points.jakarta[0]} cy={points.jakarta[1]} r="3" fill="#D97706" />
        <circle cx={points.depok[0]} cy={points.depok[1]} r="2" fill="#3B5A70" />
        <circle cx={points.yogyakarta[0]} cy={points.yogyakarta[1]} r="2" fill="#3B5A70" />
      </svg>
      <figcaption className="absolute bottom-3 left-0 text-[10px] font-mono uppercase tracking-[0.12em] text-secondary">Founding hub Pontianak · regional hub Jakarta</figcaption>
    </figure>
  );
}
