import React from "react";
import type { Metadata } from "next";
import Icon from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/section";
import TranslationNote from "@/components/legal/translation-note";

export const metadata: Metadata = {
  title: "Code of Conduct | MuaraAI",
  description: "The norms and ethics we hold while learning and building together.",
  alternates: {
    canonical: "https://muaraai.com/en/code-of-conduct",
    languages: { id: "https://muaraai.com/code-of-conduct", en: "https://muaraai.com/en/code-of-conduct", "x-default": "https://muaraai.com/code-of-conduct" },
  },
};

export default function EnglishConductPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        home={{ label: "Home", href: "/en" }}
        title="Code of Conduct & Engineering Ethics"
        description="The norms and ethics we hold while learning and building together."
      />

      <div className="space-y-8 text-sm leading-relaxed text-slate-600">
        <TranslationNote path="code-of-conduct" />

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="verified" className="w-5 h-5 text-muara-ocean" />
            1. Anti-Slop (Zero Uncurated AI Artifacts)
          </h2>
          <p>
            Muara AI firmly rejects the use of raw AI output without curation, testing and evaluation. Every piece of code, text or media released under the
            community&apos;s name must go through a quality engineering process (TDD, architecture review and visual audit). Copy-pasting raw output is a
            violation of the standard.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="school" className="w-5 h-5 text-muara-ocean" />
            2. Academic Integrity & No Cheating Services
          </h2>
          <p>
            Muara AI is an independent research and software engineering community. We strictly forbid any form of paid assignment-doing services (joki) for
            campus coursework, violations of academic integrity, or commercialising exam work. The community exists to guide practitioners, not to hand out
            shortcuts.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="lock" className="w-5 h-5 text-muara-ocean" />
            3. Zero Hardcoded Secrets & Data Security
          </h2>
          <p>
            Storing tokens, API keys or passwords directly in a public repository is strictly forbidden. All credentials must be isolated through environment
            variables. Every credential leak will be handled with immediate rotation.
          </p>
        </section>

        <section className="px-card bg-white p-6">
          <h2 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
            <Icon name="commit" className="w-5 h-5 text-muara-ocean" />
            4. Git Discipline & Mandatory Testing
          </h2>
          <p>
            Every feature change must go through a separate branch (`feat/...`, `fix/...`), use the Conventional Commits format, and pass the automated test
            suite 100% before it is merged into the main branch.
          </p>
        </section>
      </div>
    </div>
  );
}
