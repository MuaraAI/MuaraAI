"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { INDONESIA_PATH, MAP_H, MAP_W, NEIGHBOURS_PATH } from "./indonesia-map";

type UniversityNode = { id: string; label: string; city: string; province: string; x: number; y: number; role: "founding-hub" | "regional-node" | "network-node"; position: "top" | "right" | "bottom" | "left" };
const HUB: UniversityNode = { id: "ubsi-pontianak", label: "UBSI Pontianak", city: "Pontianak", province: "Kalimantan Barat", x: 200.7, y: 94, role: "founding-hub", position: "top" };
const UNIVERSITIES: UniversityNode[] = [
  { id: "untan", label: "UNTAN", city: "Pontianak", province: "Kalimantan Barat", x: 188, y: 108, role: "regional-node", position: "left" },
  { id: "itb", label: "ITB", city: "Bandung", province: "Jawa Barat", x: 158, y: 178, role: "network-node", position: "bottom" },
  { id: "ui", label: "UI", city: "Depok", province: "Jawa Barat", x: 176, y: 174, role: "regional-node", position: "right" },
  { id: "ugm", label: "UGM", city: "Yogyakarta", province: "DI Yogyakarta", x: 205, y: 190, role: "network-node", position: "bottom" },
  { id: "its", label: "ITS", city: "Surabaya", province: "Jawa Timur", x: 239, y: 195, role: "network-node", position: "bottom" },
  { id: "usu", label: "USU", city: "Medan", province: "Sumatera Utara", x: 55.2, y: 44.6, role: "network-node", position: "right" },
  { id: "unand", label: "UNAND", city: "Padang", province: "Sumatera Barat", x: 90, y: 100, role: "network-node", position: "left" },
  { id: "unhas", label: "UNHAS", city: "Makassar", province: "Sulawesi Selatan", x: 338.2, y: 163.9, role: "regional-node", position: "bottom" },
  { id: "unmul", label: "UNMUL", city: "Samarinda", province: "Kalimantan Timur", x: 260, y: 112, role: "network-node", position: "right" },
  { id: "unsrat", label: "UNSRAT", city: "Manado", province: "Sulawesi Utara", x: 354, y: 119, role: "network-node", position: "right" },
  { id: "unipa", label: "UNIPA", city: "Manokwari", province: "Papua Barat", x: 555, y: 145, role: "network-node", position: "left" },
  { id: "uncen", label: "UNCEN", city: "Jayapura", province: "Papua", x: 628.2, y: 128.1, role: "network-node", position: "left" },
];
const ALL_NODES = [HUB, ...UNIVERSITIES];
const percent = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;
function routeToHub(node: UniversityNode) { const dx = HUB.x - node.x; const dy = HUB.y - node.y; const length = Math.hypot(dx, dy) || 1; const bend = length * 0.18; const controlX = (node.x + HUB.x) / 2 + (-dy / length) * bend; const controlY = (node.y + HUB.y) / 2 + (dx / length) * bend; return `M${node.x} ${node.y} Q${controlX.toFixed(1)} ${controlY.toFixed(1)} ${HUB.x} ${HUB.y}`; }

export default function NationalCampusMap() {
  const reducedMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const routes = UNIVERSITIES.map((node) => ({ ...node, path: routeToHub(node) }));
  useEffect(() => { if (!reducedMotion) setMotionReady(true); }, [reducedMotion]);
  return (
    <figure className="national-campus-map" role="img" aria-label="Peta jaringan universitas Indonesia yang terhubung ke MuaraAI. Komunitas lahir dari UBSI Pontianak dan terbuka untuk mahasiswa dari kampus di seluruh Indonesia.">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true"><path className="smap-ctx" d={NEIGHBOURS_PATH} /><path className="smap-land" d={INDONESIA_PATH} />
        {routes.map((route, index) => <path key={route.id} className="smap-route" data-route d={route.path} pathLength={1} style={{ ["--i" as string]: index }} />)}
        {motionReady && !reducedMotion && routes.map((route, index) => <circle key={route.id} className="smap-parcel" r="3.2" opacity="0"><animateMotion path={route.path} dur="3.5s" begin={`${(index * 0.32).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".45 0 .25 1" /><animate attributeName="opacity" dur="3.5s" begin={`${(index * 0.32).toFixed(2)}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.12;.86;1" /></circle>)}
        {motionReady && !reducedMotion && <circle className="smap-ring" cx={HUB.x} cy={HUB.y} r="6" opacity="0"><animate attributeName="r" values="6;26" dur="2.8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0" dur="2.8s" repeatCount="indefinite" /></circle>}
        {UNIVERSITIES.map((node) => <circle key={node.id} className={`smap-city ${node.role === "regional-node" ? "smap-regional" : ""}`} cx={node.x} cy={node.y} r={node.role === "regional-node" ? 4.5 : 3.5} />)}<circle className="smap-hub" cx={HUB.x} cy={HUB.y} r="6" />
      </svg>
      {UNIVERSITIES.map((node) => <span key={node.id} className={`smap-label pos-${node.position}`} style={{ left: percent(node.x, MAP_W), top: percent(node.y, MAP_H) }}>{node.label}</span>)}
      <span className="smap-hub-label" style={{ left: percent(HUB.x, MAP_W), top: percent(HUB.y, MAP_H) }}><span><b>{HUB.label}</b><small>founding hub · offline meetup</small></span></span>
      <figcaption className="smap-cap">MuaraAI · jaringan universitas Indonesia</figcaption>
      <ul className="sr-only" aria-label="Universitas jaringan nasional">{ALL_NODES.map((node) => <li key={node.id}>{node.label} — {node.city}, {node.province} — {node.role}</li>)}</ul>
    </figure>
  );
}
