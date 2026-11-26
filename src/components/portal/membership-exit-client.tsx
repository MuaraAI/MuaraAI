"use client";

import React, { useState } from "react";
import { requestMembershipExit } from "@/app/actions/membership";
import Icon from "@/components/ui/icon";
import { normalizeLocale, type Locale } from "@/lib/locale";
import { DATE_LOCALE, PORTAL_COPY } from "@/lib/portal-copy";

type MembershipExitClientProps = {
  status: "active" | "exited" | "banned";
  exitedAt: string | null;
  earliestExitAt: string | null;
  locale?: Locale;
};

export default function MembershipExitClient({
  status,
  exitedAt,
  earliestExitAt,
  locale = "id",
}: MembershipExitClientProps) {
  const lang = normalizeLocale(locale);
  const t = PORTAL_COPY[lang].exit;
  const dateLocale = DATE_LOCALE[lang];
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(status === "exited");

  const earliest = earliestExitAt ? new Date(earliestExitAt) : null;
  const canExit = status === "active" && earliest !== null && Date.now() >= earliest.getTime();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    const result = await requestMembershipExit(reason);
    setLoading(false);
    if (!result.success) {
      setError(result.error || t.failed);
      return;
    }
    setDone(true);
  };

  if (status === "exited" || done) {
    return (
      <section className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="px-card mx-auto max-w-xl bg-white p-8 text-center">
          <Icon name="logout" className="mx-auto mb-4 h-12 w-12 text-secondary" />
          <h1 className="font-display text-2xl font-bold">{t.historyTitle}</h1>
          <p className="mt-3 text-sm text-secondary">
            {t.historyBody}
          </p>
          {exitedAt && (
            <p className="mt-4 font-mono text-xs text-secondary">
              {t.leftAt(new Date(exitedAt).toLocaleString(dateLocale))}
            </p>
          )}
        </div>
      </section>
    );
  }

  if (status === "banned") {
    return (
      <section className="min-h-screen bg-background px-4 py-16 text-foreground">
        <div className="px-frame [--px-line:#FDA4AF] mx-auto max-w-xl bg-white p-8 text-center">
          <Icon name="block" className="mx-auto mb-4 h-12 w-12 text-rose-600" />
          <h1 className="font-display text-2xl font-bold">{t.bannedTitle}</h1>
          <p className="mt-3 text-sm text-secondary">
            {t.bannedBody}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="px-card bg-white p-6">
      <div className="flex items-start gap-3">
        <Icon name="info" className="mt-0.5 h-5 w-5 text-muara-ocean" />
        <div>
          <h2 className="font-display text-lg font-bold text-foreground">{t.title}</h2>
          <p className="mt-1 text-xs text-secondary">
            {t.minimum}
          </p>
        </div>
      </div>

      {earliest && !canExit && (
        <p className="px-frame [--px-line:#FCD34D] mt-5 bg-amber-50 p-3 text-xs text-amber-900">
          {t.eligibleFrom(earliest.toLocaleDateString(dateLocale))}
        </p>
      )}

      {error && (
        <p className="px-frame [--px-line:#FDA4AF] mt-5 bg-rose-50 p-3 text-xs text-rose-900">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-5 space-y-3">
        <label htmlFor="exit-reason" className="block text-xs font-semibold text-foreground">
          {t.reasonLabel}
        </label>
        <textarea
          id="exit-reason"
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          maxLength={500}
          className="border-2 border-[#CFE2EE] w-full bg-surface-alt p-3 text-sm text-foreground outline-none focus:border-muara-ocean"
        />
        <button
          type="submit"
          disabled={!canExit || loading}
          className="px-btn-danger px-4 py-2.5 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? t.processing : t.submit}
        </button>
      </form>
    </section>
  );
}
