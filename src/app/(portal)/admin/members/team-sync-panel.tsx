"use client";

import React, { useState } from "react";
import { applyTeamSync, previewTeamSync, type TeamSyncFailure } from "@/app/actions/admin";
import type { SyncPlan } from "@/lib/github-teams";
import { useFeedback } from "@/components/ui/feedback";
import Icon from "@/components/ui/icon";

type Result = { tone: "success" | "error"; text: string; failures?: TeamSyncFailure[] };

const ACTION_LABEL: Record<TeamSyncFailure["action"], string> = { create: "membuat tim", add: "menambahkan", remove: "mengeluarkan" };
const isEmpty = (plan: SyncPlan) => plan.create.length + plan.add.length + plan.remove.length === 0;

/** Shows what would change in the GitHub org teams, and applies it after a confirmation. */
export default function TeamSyncPanel() {
  const { confirm, notify } = useFeedback();
  const [plan, setPlan] = useState<SyncPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  const preview = async () => {
    setBusy(true);
    setResult(null);
    const response = await previewTeamSync();
    setBusy(false);
    if (response.success) setPlan(response.plan);
    else setResult({ tone: "error", text: response.error });
  };

  const apply = async () => {
    if (!plan) return;
    const ok = await confirm({
      title: "Terapkan perubahan ke GitHub org?",
      message: `Ini mengubah tim di org MuaraAI: ${plan.create.length} tim dibuat, ${plan.add.length} orang ditambahkan, ${plan.remove.length} orang dikeluarkan.`,
      confirmLabel: "Terapkan",
    });
    if (!ok) return;

    setBusy(true);
    const response = await applyTeamSync();
    if ("error" in response) {
      setBusy(false);
      setResult({ tone: "error", text: response.error });
      return;
    }
    const { created, added, removed } = response.applied;
    const summary = `${created} tim dibuat, ${added} orang ditambahkan, ${removed} dikeluarkan.`;
    setResult({ tone: response.success ? "success" : "error", text: response.success ? summary : `${summary} Sebagian gagal:`, failures: response.failures });
    notify({ tone: response.success ? "success" : "error", title: response.success ? "Tim GitHub tersinkron" : "Sinkron tim GitHub sebagian gagal", message: summary });

    const refreshed = await previewTeamSync();
    if (refreshed.success) setPlan(refreshed.plan);
    setBusy(false);
  };

  return (
    <section className="px-card bg-white p-6 sm:p-8 space-y-4" aria-labelledby="team-sync-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="team-sync-title" className="font-display text-base font-bold text-foreground">Tim GitHub</h2>
          <p className="text-xs text-secondary">Samakan tim di org MuaraAI dengan peran di web. Orang yang belum terdaftar di web tidak pernah dikeluarkan.</p>
        </div>
        <button
          type="button"
          disabled={busy}
          onClick={preview}
          className="px-btn-ghost [--px-off:3px] inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground disabled:opacity-50"
        >
          <Icon name="sync" className={`h-3.5 w-3.5 text-muara-ocean ${busy ? "animate-spin" : ""}`} />
          <span>{busy ? "Memeriksa..." : "Lihat rencana sinkron"}</span>
        </button>
      </div>

      {result && (
        <div role={result.tone === "error" ? "alert" : "status"} className={`text-sm ${result.tone === "error" ? "text-rose-800" : "text-emerald-800"}`}>
          <p>{result.text}</p>
          {result.failures && result.failures.length > 0 && (
            <ul className="mt-1 list-disc pl-5 text-xs">
              {result.failures.map((failure, index) => (
                <li key={`${failure.action}-${failure.team}-${failure.user ?? ""}-${index}`}>
                  Gagal {ACTION_LABEL[failure.action]} {failure.user ? `@${failure.user} di ` : ""}{failure.team}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {plan && (
        <div className="space-y-3 text-xs">
          {isEmpty(plan) ? (
            <p className="text-sm text-emerald-800">Tim GitHub sudah sesuai dengan peran di web.</p>
          ) : (
            <>
              {plan.create.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground">Tim yang akan dibuat</h3>
                  <ul className="list-disc pl-5 text-secondary">{plan.create.map((team) => <li key={team.slug}>{team.slug} (di bawah {team.parent})</li>)}</ul>
                </div>
              )}
              {plan.add.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground">Akan ditambahkan</h3>
                  <ul className="list-disc pl-5 text-secondary">{plan.add.map((item) => <li key={`${item.team}-${item.user}`}>@{item.user} ke {item.team}</li>)}</ul>
                </div>
              )}
              {plan.remove.length > 0 && (
                <div>
                  <h3 className="font-semibold text-foreground">Akan dikeluarkan</h3>
                  <ul className="list-disc pl-5 text-secondary">{plan.remove.map((item) => <li key={`${item.team}-${item.user}`}>@{item.user} dari {item.team}</li>)}</ul>
                </div>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={apply}
                className="px-btn inline-flex min-h-11 items-center px-5 py-2.5 text-sm font-semibold disabled:opacity-50"
              >
                Terapkan ke GitHub
              </button>
            </>
          )}
          {plan.unknown.length > 0 && (
            <p className="text-secondary">
              Belum terdaftar di web, tidak disentuh: {plan.unknown.map((user) => `@${user}`).join(", ")}.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
