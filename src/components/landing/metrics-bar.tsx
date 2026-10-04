import React from "react";
import Icon, { IconName } from "@/components/ui/icon";

export default function MetricsBar() {
  const metrics: { value: string; label: string; sub: string; icon: IconName }[] = [
    {
      value: "126+",
      label: "Automated Tests",
      sub: "100% Offline Passing",
      icon: "verified_user",
    },
    {
      value: "6",
      label: "Layanan Kampus",
      sub: "StudentV2, MyBest, Library, etc.",
      icon: "hub",
    },
    {
      value: "0%",
      label: "AI-Slop Tolerance",
      sub: "Zero uncurated raw outputs",
      icon: "shield",
    },
    {
      value: "100%",
      label: "Open Source",
      sub: "Independent & Self-funded",
      icon: "code_blocks",
    },
  ];

  return (
    <section className="border-b border-border bg-surface-alt/60 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex flex-col items-center sm:items-start p-2">
              <div className="flex items-center gap-2 mb-1">
                <Icon name={m.icon} className="w-6 h-6 text-muara-ocean" />
                <span className="font-display font-bold text-2xl sm:text-3xl text-foreground tracking-tight">
                  {m.value}
                </span>
              </div>
              <div className="text-sm font-semibold text-slate-800">{m.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
