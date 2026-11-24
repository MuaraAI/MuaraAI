import React from "react";
import { monthLabel, type ContributionRules, type Division, type MonthlyStats, type Standing } from "@/lib/contributions/rules";

export interface ContributionRow {
  id: string;
  name: string;
  github: string;
  division: Division;
  standing: Standing;
  stats: MonthlyStats | null;
  lastEvaluation: { month: string; met: boolean; action: string; enforced: boolean } | null;
}

const ACTION_LABELS: Record<string, string> = { none: "aman", warn: "peringatan", kick: "kick", recover: "pulih" };

function progressText(row: ContributionRow, rules: ContributionRules): string {
  const stats = row.stats;
  if (!stats) return "Belum ada data";
  if (row.division === "builder") {
    const t = rules.builder;
    return `PR ${stats.mergedPrs}/${t.mergedPrs} · Eksternal ${stats.externalPrs}/${t.externalPrs} · Commit ${stats.commits}/${t.commits} · Repo baru ${stats.newRepos}/${t.newRepos}`;
  }
  const t = rules.creative;
  return `PR ${stats.mergedPrs}/${t.mergedPrs} · Eksternal ${stats.externalPrs}/${t.externalPrs} · Karya baru ${stats.newWorks}/${t.newWorks}`;
}

function evaluationText(row: ContributionRow): string {
  const evaluation = row.lastEvaluation;
  if (!evaluation) return "-";
  const result = evaluation.met ? "memenuhi" : "belum memenuhi";
  const suffix = evaluation.enforced ? "" : " · dry run";
  return `${monthLabel(evaluation.month)}: ${result} · ${ACTION_LABELS[evaluation.action] ?? evaluation.action}${suffix}`;
}

export default function ContributionsTable({ rows, rules }: { rows: ContributionRow[]; rules: ContributionRules }) {
  if (rows.length === 0) {
    return <p className="text-sm text-secondary">Belum ada anggota.</p>;
  }

  return (
    <div className="px-card bg-white p-4 sm:p-6 overflow-x-auto">
      <table className="w-full text-left text-xs font-mono">
        <thead>
          <tr className="border-b border-stroke text-secondary uppercase">
            <th className="py-2.5 px-3">Anggota</th>
            <th className="py-2.5 px-3">Divisi</th>
            <th className="py-2.5 px-3">Status</th>
            <th className="py-2.5 px-3">Progres bulan ini</th>
            <th className="py-2.5 px-3">Evaluasi terakhir</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stroke text-slate-700">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="py-3 px-3">
                <div className="font-bold text-foreground">{row.name}</div>
                <div className="text-[10px] text-secondary">@{row.github}</div>
              </td>
              <td className="py-3 px-3 capitalize">{row.division}</td>
              <td className="py-3 px-3">
                <span
                  className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${
                    row.standing === "warned" ? "bg-amber-50 text-amber-800 border border-amber-200" : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  }`}
                >
                  {row.standing === "warned" ? "Diperingatkan" : "Baik"}
                </span>
              </td>
              <td className="py-3 px-3">{progressText(row, rules)}</td>
              <td className="py-3 px-3 text-secondary">{evaluationText(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
