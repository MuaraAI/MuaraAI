"use client";

import React, { useEffect, useState } from "react";
import { useReducedMotion } from "motion/react";
import { INDONESIA_PATH, MAP_H, MAP_POINTS, MAP_W, NEIGHBOURS_PATH } from "./indonesia-map";

const SOURCES = [
  { key: "jawa", label: "UBSI Jakarta", pos: "b" as const },
  { key: "sumatra", label: "UBSI Depok", pos: "r" as const },
  { key: "sulawesi", label: "UBSI Yogyakarta", pos: "b" as const },
] as const;

const HUB = MAP_POINTS.hub;
const pct = (value: number, total: number) => `${((value / total) * 100).toFixed(2)}%`;

function arc([x, y]: readonly [number, number]) {
  const [hx, hy] = HUB;
  const mx = (x + hx) / 2;
  const my = (y + hy) / 2;
  return `M${x} ${y} Q${mx.toFixed(1)} ${(my - 18).toFixed(1)} ${hx} ${hy}`;
}

export default function NationalCampusMap() {
  const reducedMotion = useReducedMotion();
  const [motionReady, setMotionReady] = useState(false);
  const routes = SOURCES.map((source) => ({ ...source, d: arc(MAP_POINTS[source.key]) }));

  useEffect(() => {
    if (!reducedMotion) setMotionReady(true);
  }, [reducedMotion]);

  return (
    <figure className="smap smap-light national-campus-map" role="img" aria-label="Peta Indonesia dengan rute komunitas mahasiswa dari kampus di seluruh Indonesia menuju Pontianak sebagai founding hub dan Jakarta sebagai regional hub.">
      <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} aria-hidden="true">
        <path className="smap-ctx" d={NEIGHBOURS_PATH} />
        <path className="smap-land" d={INDONESIA_PATH} />
        {routes.map((route, index) => <path key={route.key} className="smap-route" data-route d={route.d} pathLength={1} style={{ ["--i" as string]: index }} />)}
        {motionReady && !reducedMotion && routes.map((route, index) => <circle key={route.key} className="smap-parcel" r="3.2" opacity="0"><animateMotion path={route.d} dur="3.5s" begin={`${(index * 0.7).toFixed(2)}s`} repeatCount="indefinite" calcMode="spline" keyPoints="0;1" keyTimes="0;1" keySplines=".45 0 .25 1" /><animate attributeName="opacity" dur="3.5s" begin={`${(index * 0.7).toFixed(2)}s`} repeatCount="indefinite" values="0;1;1;0" keyTimes="0;.12;.86;1" /></circle>)}
        {motionReady && !reducedMotion && <circle className="smap-ring" cx={HUB[0]} cy={HUB[1]} r="6" opacity="0"><animate attributeName="r" values="6;26" dur="2.8s" repeatCount="indefinite" /><animate attributeName="opacity" values=".8;0" dur="2.8s" repeatCount="indefinite" /></circle>}
        {SOURCES.map((source) => <circle key={source.key} className="smap-city" cx={MAP_POINTS[source.key][0]} cy={MAP_POINTS[source.key][1]} r="3.2" />)}
        <circle className="smap-hub" cx={HUB[0]} cy={HUB[1]} r="6" />
      </svg>
      {SOURCES.map((source) => <span key={source.key} className={`smap-label pos-${source.pos}`} style={{ left: pct(MAP_POINTS[source.key][0], MAP_W), top: pct(MAP_POINTS[source.key][1], MAP_H) }} aria-hidden="true">{source.label}</span>)}
      <span className="smap-hub-label" style={{ left: pct(HUB[0], MAP_W), top: pct(HUB[1], MAP_H) }} aria-hidden="true"><span><b>UBSI Pontianak</b><small>founding hub · offline meetup</small></span></span>
      <figcaption className="smap-cap" aria-hidden="true">MuaraAI · jaringan mahasiswa UBSI</figcaption>
    </figure>
  );
}
