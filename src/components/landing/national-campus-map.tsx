"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { INDONESIA_PATH, MAP_H, MAP_W, NEIGHBOURS_PATH } from "./indonesia-map";

type CampusNode = { id: string; label: string; city: string; region: string; x: number; y: number; role: "founding-hub" | "regional-hub" | "network-node"; position: "top" | "right" | "bottom" | "left" };
const HUB: CampusNode = { id: "pontianak", label: "UBSI Pontianak", city: "Pontianak", region: "Kalimantan Barat", x: 200.7, y: 94, role: "founding-hub", position: "top" };
const NODES: CampusNode[] = [
  { id: "jakarta", label: "UBSI Jakarta", city: "Jakarta", region: "DKI Jakarta", x: 166.7, y: 178.3, role: "regional-hub", position: "bottom" },
  { id: "depok", label: "UBSI Depok", city: "Depok", region: "Jawa Barat", x: 180, y: 185, role: "network-node", position: "right" },
  { id: "yogyakarta", label: "UBSI Yogyakarta", city: "Yogyakarta", region: "DI Yogyakarta", x: 205, y: 190, role: "network-node", position: "bottom" },
  { id: "makassar", label: "UBSI Makassar", city: "Makassar", region: "Sulawesi Selatan", x: 338.2, y: 163.9, role: "network-node", position: "bottom" },
  { id: "jayapura", label: "UBSI Jayapura", city: "Jayapura", region: "Papua", x: 628.2, y: 128.1, role: "network-node", position: "left" },
];
const allNodes = [HUB, ...NODES];
const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;
function arc(source: CampusNode) { const dx = HUB.x - source.x; const dy = HUB.y - source.y; const length = Math.hypot(dx, dy) || 1; const bend = length * 0.18; const controlX = (source.x + HUB.x) / 2 + (-dy / length) * bend; const controlY = (source.y + HUB.y) / 2 + (dx / length) * bend; return `M${source.x} ${source.y} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${HUB.x} ${HUB.y}`; }

export default function NationalCampusMap() {
  const reducedMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const routes = NODES.map((node) => ({ ...node, d: arc(node) }));
  useEffect(() => { if (!reducedMotion) setMotionReady(true); }, [reducedMotion]);
  return (
    <figure className="national-campus-map" role="img" aria-label="Peta Indonesia dengan jaringan mahasiswa dari berbagai kampus menuju UBSI Pontianak sebagai founding hub dan UBSI Jakarta sebagai regional hub.">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
        <path className="smap-ctx" d={NEIGHBOURS_PATH} /><path className="smap-land" d={INDONESIA_PATH} />
        {routes.map((route, index) => <path key={route.id} className="smap-route" data-route d={route.d} pathLength={1} style={{ ["--i" as string]: index }} />)}
        {motionReady && !reducedMotion && routes.map((route, index) => <circle key={route.id} className="smap-parcel" r="3.2" opacity="0"><animateMotion path={route.d} dur="3.5s" begin={`${(index * 0.55).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".45 0 .25 1" /><animate attributeName="opacity" dur="3.5s" begin={`${(index * 0.55).toFixed(2)}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.12;.86;1" /></circle>)}
        {motionReady && !reducedMotion && <circle className="smap-ring" cx={HUB.x} cy={HUB.y} r="6" opacity="0"><animate attributeName="r" values="6;26" dur="2.8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0" dur="2.8s" repeatCount="indefinite" /></circle>}
        {NODES.map((node) => <circle key={node.id} className={`smap-city ${node.role === "regional-hub" ? "smap-regional" : ""}`} cx={node.x} cy={node.y} r={node.role === "regional-hub" ? 4.5 : 3.5} />)}
        <circle className="smap-hub" cx={HUB.x} cy={HUB.y} r="6" />
      </svg>
      {NODES.map((node) => <span key={node.id} className={`smap-label pos-${node.position}`} style={{ left: pct(node.x, MAP_W), top: pct(node.y, MAP_H) }}>{node.label}</span>)}
      <span className="smap-hub-label" style={{ left: pct(HUB.x, MAP_W), top: pct(HUB.y, MAP_H) }}><span><b>{HUB.label}</b><small>founding hub · offline meetup</small></span></span>
      <figcaption className="smap-cap">MuaraAI · jaringan kampus nasional</figcaption>
      <ul className="sr-only" aria-label="Kampus jaringan nasional">{allNodes.map((node) => <li key={node.id}>{node.label} — {node.city}, {node.region} — {node.role}</li>)}</ul>
    </figure>
  );
}
