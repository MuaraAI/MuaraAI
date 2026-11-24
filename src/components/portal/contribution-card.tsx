import React from "react";
import { monthLabel, type ContributionRules, type Division, type MonthlyStats, type Standing } from "@/lib/contributions/rules";

interface Metric {
  label: string;
  value: number;
  target: number;
}

function metricsFor(division: Division, stats: MonthlyStats, rules: ContributionRules): Metric[] {
  if (division === "builder") {
    const target = rules.builder;
    return [
      { label: "PR ter-merge", value: stats.mergedPrs, target: target.mergedPrs },
      { label: "PR di repo orang lain", value: stats.externalPrs, target: target.externalPrs },
      { label: "Commit di PR ter-merge", value: stats.commits, target: target.commits },
      { label: "Repo baru", value: stats.newRepos, target: target.newRepos },
    ];
  }
  const target = rules.creative;
  return [
    { label: "PR ter-merge", value: stats.mergedPrs, target: target.mergedPrs },
    { label: "PR di repo orang lain", value: stats.externalPrs, target: target.externalPrs },
    { label: "Karya baru", value: stats.newWorks, target: target.newWorks },
  ];
}

export default function ContributionCard({
  division,
  stats,
  rules,
  standing,
  month,
}: {
  division: Division;
  stats: MonthlyStats | null;
  rules: ContributionRules;
  standing: Standing;
  month: string;
}) {
  const metrics = stats ? metricsFor(division, stats, rules) : [];

  return (
    <section className="px-card bg-white p-6 space-y-4">
      <div>
        <div className="text-xs font-mono uppercase text-secondary">{monthLabel(month)}</div>
        <h2 className="font-display text-lg font-bold text-foreground">Kontribusi bulan ini</h2>
      </div>

      {standing === "warned" && (
        <div role="alert" className="px-frame [--px-line:#FCD34D] bg-amber-50/80 p-4 text-sm text-amber-950">
          Bulan lalu belum memenuhi target. Penuhi target bulan ini agar keanggotaanmu tetap aman.
        </div>
      )}

      {stats ? (
        <ul className="space-y-2.5 text-sm">
          {metrics.map((metric) => (
            <li key={metric.label} className="flex items-center justify-between gap-3">
              <span className="text-secondary">{metric.label}</span>
              <span className="flex items-center gap-2">
                <span className="font-mono font-semibold text-foreground">{metric.value}/{metric.target}</span>
                {metric.value >= metric.target && (
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">Tercapai</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-secondary">Belum ada data kontribusi bulan ini. Data diperbarui otomatis setiap hari.</p>
      )}

      <p className="text-xs text-secondary">
        Hanya PR yang sudah di-merge dan di-approve anggota lain yang dihitung.
      </p>
    </section>
  );
}
