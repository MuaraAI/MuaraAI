"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { submitProofOfWork } from "@/app/actions/pow";
import { AFFILIATIONS, MIN_JOIN_REASON_LENGTH, type Division, type Locale, type PoWInput } from "@/lib/validation";
import { ONBOARDING_COPY } from "@/lib/onboarding-copy";
import type { PositionsConfig } from "@/lib/positions";
import Icon from "@/components/ui/icon";
import PixelSelect from "@/components/ui/pixel-select";

type Step = 0 | 1 | 2 | 3;

const DRAFT_KEY = "muaraai_onboarding_draft";

const DIVISION_LABELS: Record<Division, string> = { builder: "Builder", creative: "Creative" };
const DIVISIONS: readonly Division[] = ["builder", "creative"];

function buildInitial(positions: PositionsConfig, initial?: Partial<PoWInput>): PoWInput {
  const division: Division = initial?.division === "creative" ? "creative" : "builder";
  const track = positions[division].includes(initial?.track ?? "") ? (initial?.track as string) : positions[division][0] ?? "";
  const secondaryDivision =
    initial?.secondaryDivision && initial.secondaryDivision !== division ? initial.secondaryDivision : undefined;
  const secondaryTrack = secondaryDivision
    ? positions[secondaryDivision].includes(initial?.secondaryTrack ?? "")
      ? initial?.secondaryTrack
      : positions[secondaryDivision][0]
    : undefined;

  return {
    fullName: initial?.fullName || "",
    affiliation: AFFILIATIONS.includes(initial?.affiliation as never) ? (initial?.affiliation as PoWInput["affiliation"]) : "mahasiswa",
    institution: initial?.institution || "",
    phoneWa: initial?.phoneWa || "",
    telegramUsername: initial?.telegramUsername || "",
    division,
    track,
    secondaryDivision,
    secondaryTrack,
    joinReason: initial?.joinReason || "",
    toolchainNarrative: initial?.toolchainNarrative || "",
    portfolioUrl: initial?.portfolioUrl || "",
    websiteUrl: initial?.websiteUrl || "",
    linkedinUrl: initial?.linkedinUrl || "",
    instagramUrl: initial?.instagramUrl || "",
    threadsUrl: initial?.threadsUrl || "",
    xUrl: initial?.xUrl || "",
  };
}

function canContinue(step: Step, data: PoWInput): boolean {
  if (step === 0) return data.fullName.trim().length >= 3 && data.phoneWa.trim().length >= 9;
  if (step === 1) {
    return (
      data.portfolioUrl.startsWith("http") &&
      data.toolchainNarrative.trim().length >= 15 &&
      data.joinReason.trim().length >= MIN_JOIN_REASON_LENGTH &&
      data.track.length > 0
    );
  }
  return true;
}

export default function PoWForm({
  authenticated = false,
  githubUsername,
  initialData,
  rejectionReason,
  positions,
  locale = "id",
}: {
  authenticated?: boolean;
  githubUsername?: string;
  initialData?: Partial<PoWInput>;
  rejectionReason?: string;
  positions: PositionsConfig;
  locale?: Locale;
}) {
  const t = ONBOARDING_COPY[locale] ?? ONBOARDING_COPY.id;
  const [step, setStep] = useState<Step>(0);
  const [formData, setFormData] = useState<PoWInput>(() => buildInitial(positions, initialData));
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authenticated || typeof window === "undefined" || !window.localStorage) return;
    const draft = window.localStorage.getItem(DRAFT_KEY);
    if (!draft) return;
    try {
      const parsed = JSON.parse(draft) as Partial<PoWInput>;
      setFormData(buildInitial(positions, parsed));
      if (parsed.fullName && parsed.joinReason && parsed.portfolioUrl) {
        setStep(3);
        setAgreed(true);
      }
    } catch {
      window.localStorage.removeItem(DRAFT_KEY);
    }
  }, [authenticated, positions]);

  const update = <K extends keyof PoWInput>(key: K, value: PoWInput[K]) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const changeDivision = (value: string) => {
    const division = value as Division;
    setFormData((current) => {
      const stillSecondary = current.secondaryDivision && current.secondaryDivision !== division;
      return {
        ...current,
        division,
        track: positions[division][0] ?? "",
        secondaryDivision: stillSecondary ? current.secondaryDivision : undefined,
        secondaryTrack: stillSecondary ? current.secondaryTrack : undefined,
      };
    });
  };

  const changeSecondaryDivision = (value: string) => {
    setFormData((current) =>
      value === ""
        ? { ...current, secondaryDivision: undefined, secondaryTrack: undefined }
        : { ...current, secondaryDivision: value as Division, secondaryTrack: positions[value as Division][0] ?? "" }
    );
  };

  const next = () => setStep((current) => Math.min(3, current + 1) as Step);
  const previous = () => setStep((current) => Math.max(0, current - 1) as Step);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
      setError(t.agreeRequired);
      return;
    }
    setError(null);
    if (!authenticated) {
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(formData));
      window.location.href = t.loginHref;
      return;
    }
    setLoading(true);
    const result = await submitProofOfWork(formData, locale);
    setLoading(false);
    if (result.success) {
      if (typeof window !== "undefined" && window.localStorage) {
        window.localStorage.removeItem(DRAFT_KEY);
      }
      window.location.href = "/dashboard";
      return;
    }
    setError(result.error || t.submitFailed);
  };

  const secondaryOptions = [
    { value: "", label: t.none },
    ...DIVISIONS.filter((division) => division !== formData.division).map((division) => ({
      value: division,
      label: DIVISION_LABELS[division],
    })),
  ];
  const reasonLength = formData.joinReason.trim().length;
  const positionSummary = [
    `${DIVISION_LABELS[formData.division]} · ${formData.track}`,
    formData.secondaryDivision ? `${DIVISION_LABELS[formData.secondaryDivision]} · ${formData.secondaryTrack}` : "",
  ]
    .filter(Boolean)
    .join("  +  ");

  return (
    <div className="px-card bg-white p-6 sm:p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-[0.14em] text-muara-ocean">{t.eyebrow}</div>
        <h2 className="mt-2 font-display text-2xl font-bold text-foreground">{t.title}</h2>
        <p className="mt-2 text-sm text-secondary">{t.intro}</p>
      </div>

      {rejectionReason && (
        <div className="px-frame [--px-line:#FCD34D] mb-6 bg-amber-50/80 p-4 text-xs text-amber-950 flex items-start gap-3">
          <Icon name="info" className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-amber-900">{t.rejectionTitle}</div>
            <p className="text-secondary leading-relaxed">
              &quot;{rejectionReason}&quot;
            </p>
            <p className="text-amber-800 font-medium pt-1">
              {t.rejectionNote}
            </p>
          </div>
        </div>
      )}

      {authenticated && (
        <div className="px-frame [--px-line:#7DD3FC] mb-8 bg-sky-50/80 p-4 text-xs text-sky-900 flex items-start gap-3">
          <Icon name="check_circle" className="w-5 h-5 text-muara-ocean shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-sm text-foreground">
              {t.connected} {githubUsername ? <span className="font-mono text-muara-ocean">(@{githubUsername})</span> : null}
            </div>
            <p className="text-secondary leading-relaxed">
              {t.connectedBody}
            </p>
          </div>
        </div>
      )}

      <ol aria-label={t.progress} className="mb-8 grid grid-cols-4 gap-2">
        {t.steps.map((label, index) => (
          <li key={label} className={`border-t-2 pt-2 text-[11px] font-medium ${index <= step ? "border-muara-ocean text-foreground" : "border-stroke text-secondary"}`}>
            <span className="block">{index + 1}. {label}</span>
          </li>
        ))}
      </ol>

      {error && <div role="alert" className="px-frame [--px-line:#FDA4AF] mb-6 bg-rose-50 p-3.5 text-sm text-rose-800">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        {step === 0 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">{t.aboutLegend}</legend>
            <p className="text-sm text-secondary">{t.aboutIntro}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="fullName" label={t.fullName} value={formData.fullName} onChange={(value) => update("fullName", value)} required />
              <SelectField
                id="affiliation"
                label={t.status}
                value={formData.affiliation}
                options={AFFILIATIONS.map((value) => ({ value, label: t.affiliations[value] }))}
                onChange={(value) => update("affiliation", value as PoWInput["affiliation"])}
              />
              <Field id="institution" label={t.institution} value={formData.institution || ""} onChange={(value) => update("institution", value)} placeholder={t.institutionPlaceholder} />
              <Field id="phoneWa" label={t.whatsapp} value={formData.phoneWa} onChange={(value) => update("phoneWa", value)} required type="tel" placeholder={t.whatsappPlaceholder} />
              <Field id="telegramUsername" label={t.telegram} value={formData.telegramUsername || ""} onChange={(value) => update("telegramUsername", value)} placeholder="@username" />
            </div>
          </fieldset>
        )}

        {step === 1 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">{t.proofLegend}</legend>
            <Field id="portfolioUrl" label={t.portfolio} value={formData.portfolioUrl} onChange={(value) => update("portfolioUrl", value)} required type="url" />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField
                id="division"
                label={t.division}
                value={formData.division}
                options={DIVISIONS.map((value) => ({ value, label: DIVISION_LABELS[value] }))}
                onChange={changeDivision}
              />
              <SelectField
                id="track"
                label={t.track}
                value={formData.track}
                options={positions[formData.division].map((value) => ({ value, label: value }))}
                onChange={(value) => update("track", value)}
              />
              <SelectField
                id="secondaryDivision"
                label={t.secondaryDivision}
                required={false}
                value={formData.secondaryDivision ?? ""}
                options={secondaryOptions}
                onChange={changeSecondaryDivision}
              />
              {formData.secondaryDivision && (
                <SelectField
                  id="secondaryTrack"
                  label={t.secondaryTrack}
                  value={formData.secondaryTrack ?? ""}
                  options={positions[formData.secondaryDivision].map((value) => ({ value, label: value }))}
                  onChange={(value) => update("secondaryTrack", value)}
                />
              )}
            </div>
            <TextAreaField id="toolchainNarrative" label={t.toolchain} value={formData.toolchainNarrative} onChange={(value) => update("toolchainNarrative", value)} required />
            <div>
              <TextAreaField id="joinReason" label={t.reason} value={formData.joinReason} onChange={(value) => update("joinReason", value)} required />
              <p className="mt-1 text-right font-mono text-xs text-secondary">{reasonLength}/{MIN_JOIN_REASON_LENGTH}</p>
            </div>
          </fieldset>
        )}

        {step === 2 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">{t.profileLegend}</legend>
            <p className="text-sm text-secondary">{t.profileIntro}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="websiteUrl" label={t.website} value={formData.websiteUrl || ""} onChange={(value) => update("websiteUrl", value)} type="url" />
              <Field id="linkedinUrl" label={t.linkedin} value={formData.linkedinUrl || ""} onChange={(value) => update("linkedinUrl", value)} type="url" />
              <Field id="instagramUrl" label={t.instagram} value={formData.instagramUrl || ""} onChange={(value) => update("instagramUrl", value)} />
              <Field id="xUrl" label={t.x} value={formData.xUrl || ""} onChange={(value) => update("xUrl", value)} />
            </div>
          </fieldset>
        )}

        {step === 3 && (
          <fieldset className="space-y-4">
            <legend className="font-display text-xl font-semibold text-foreground">{t.reviewLegend}</legend>
            <div className="px-frame [--px-line:#CFE2EE] divide-y divide-stroke bg-surface-alt text-sm">
              <Summary label={t.summaryName} value={formData.fullName} notFilled={t.notFilled} />
              <Summary label={t.summaryStatus} value={[t.affiliations[formData.affiliation], formData.institution].filter(Boolean).join(" · ")} notFilled={t.notFilled} />
              <Summary label={t.summaryProof} value={formData.portfolioUrl} notFilled={t.notFilled} />
              <Summary label={t.summaryPosition} value={positionSummary} notFilled={t.notFilled} />
              <Summary label={t.summaryReason} value={formData.joinReason.trim()} notFilled={t.notFilled} />
            </div>
            <p className="text-xs leading-relaxed text-secondary">{t.disclaimer}</p>
          </fieldset>
        )}

        {step === 3 && (
          <label className="px-frame [--px-line:#CFE2EE] flex items-start gap-3 bg-surface-alt p-4 text-xs leading-relaxed text-secondary">
            <input type="checkbox" checked={agreed} onChange={(event) => { setAgreed(event.target.checked); setError(null); }} className="mt-0.5 h-4 w-4 shrink-0 accent-muara-ocean" />
            <span>{t.agreeBefore}<Link href="/privacy" target="_blank" className="font-semibold text-muara-ocean underline">Privacy Policy</Link>, <Link href="/terms" target="_blank" className="font-semibold text-muara-ocean underline">Terms of Service</Link>{t.agreeAnd}<Link href="/code-of-conduct" target="_blank" className="font-semibold text-muara-ocean underline">Code of Conduct</Link>{t.agreeAfter}</span>
          </label>
        )}
        <div className="flex flex-col-reverse gap-3 border-t border-stroke pt-5 sm:flex-row sm:justify-between">
          <button type="button" onClick={previous} disabled={step === 0} className="px-btn-ghost [--px-off:3px] min-h-11 px-4 py-2.5 text-sm font-semibold text-foreground disabled:opacity-40">{t.back}</button>
          {step < 3 ? (
            <button type="button" onClick={next} disabled={!canContinue(step, formData)} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{t.next}</button>
          ) : (
            <button type="submit" disabled={loading || !agreed} className="px-btn min-h-11 px-5 py-2.5 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50">{authenticated ? (loading ? t.submitting : t.submit) : t.toGithub}</button>
          )}
        </div>
      </form>
    </div>
  );
}

function Field({ id, label, value, onChange, required = false, type = "text", maxLength, placeholder }: { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean; type?: string; maxLength?: number; placeholder?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label><input id={id} type={type} value={value} placeholder={placeholder} required={required} maxLength={maxLength} onChange={(event) => onChange(event.target.value)} className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white" /></div>;
}

function SelectField({ id, label, value, options, onChange, required = true }: { id: string; label: string; value: string; options: readonly { value: string; label: string }[]; onChange: (value: string) => void; required?: boolean }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label><PixelSelect id={id} value={value} onChange={onChange} options={options} /></div>;
}

function TextAreaField({ id, label, value, onChange, required }: { id: string; label: string; value: string; onChange: (value: string) => void; required?: boolean }) {
  return <div><label htmlFor={id} className="mb-1.5 block text-sm font-medium text-foreground">{label}{required ? " *" : ""}</label><textarea id={id} value={value} required={required} rows={4} onChange={(event) => onChange(event.target.value)} className="border-2 border-[#CFE2EE] w-full bg-surface-alt px-3.5 py-2.5 text-sm text-foreground focus:bg-white" /></div>;
}

function Summary({ label, value, notFilled }: { label: string; value: string; notFilled: string }) {
  return <div className="grid gap-1 px-4 py-3 sm:grid-cols-[140px_1fr]"><dt className="font-medium text-secondary">{label}</dt><dd className="break-words text-foreground">{value || notFilled}</dd></div>;
}
