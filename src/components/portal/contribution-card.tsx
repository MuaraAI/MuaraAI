import React from "react";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { PORTAL_COPY } from "@/lib/portal-copy";
import { monthLabel, type ContributionRules, type Division, type MonthlyStats, type Standing } from "@/lib/contributions/rules";

interface Metric {
  label: string;
  value: number;
  target: number;
}

function metricsFor(division: Division, stats: MonthlyStats, rules: ContributionRules, labels: (typeof PORTAL_COPY)["id"]["contribution"]["metrics"] | (typeof PORTAL_COPY)["en"]["contribution"]["metrics"]): Metric[] {
  if (division === "builder") {
    const target = rules.builder;
    return [
      { label: labels.mergedPrs, value: stats.mergedPrs, target: target.mergedPrs },
      { label: labels.externalPrs, value: stats.externalPrs, target: target.externalPrs },
      { label: labels.commits, value: stats.commits, target: target.commits },
      { label: labels.newRepos, value: stats.newRepos, target: target.newRepos },
    ];
  }
  const target = rules.creative;
  return [
    { label: labels.mergedPrs, value: stats.mergedPrs, target: target.mergedPrs },
    { label: labels.externalPrs, value: stats.externalPrs, target: target.externalPrs },
    { label: labels.newWorks, value: stats.newWorks, target: target.newWorks },
  ];
}

export default function ContributionCard({
  division,
  stats,
  rules,
  standing,
  month,
  locale = "id",
}: {
  division: Division;
  stats: MonthlyStats | null;
  rules: ContributionRules;
  standing: Standing;
  month: string;
  locale?: Locale;
}) {
  const t = PORTAL_COPY[normalizeLocale(locale)].contribution;
  const metrics = stats ? metricsFor(division, stats, rules, t.metrics) : [];

  return (
    <section className="px-card bg-white p-6 space-y-4">
      <div>
        <div className="text-xs font-mono uppercase text-secondary">{monthLabel(month, locale)}</div>
        <h2 className="font-display text-lg font-bold text-foreground">{t.title}</h2>
      </div>

      {standing === "warned" && (
        <div role="alert" className="px-frame [--px-line:#FCD34D] bg-amber-50/80 p-4 text-sm text-amber-950">
          {t.warned}
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
                  <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-800">{t.reached}</span>
                )}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-secondary">{t.empty}</p>
      )}

      <p className="text-xs text-secondary">
        {t.footnote}
      </p>
    </section>
  );
}
