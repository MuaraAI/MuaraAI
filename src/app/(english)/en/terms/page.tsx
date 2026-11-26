import React from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/section";
import TranslationNote from "@/components/legal/translation-note";

export const metadata: Metadata = {
  title: "Terms of Service | MuaraAI",
  description: "The ground rules for using the platform and for membership of Muara AI.",
  alternates: {
    canonical: "https://muaraai.com/en/terms",
    languages: { id: "https://muaraai.com/terms", en: "https://muaraai.com/en/terms", "x-default": "https://muaraai.com/terms" },
  },
};

export default function EnglishTermsPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        home={{ label: "Home", href: "/en" }}
        title="Terms of Service"
        description="The ground rules for using the platform and for membership of Muara AI."
      />

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <TranslationNote path="terms" />

        <p>
          Welcome to the official <strong>Muara AI</strong> platform (muaraai.com). By accessing and using the service, you agree to the following rules of
          meritocracy and community regulation:
        </p>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Membership & Proof of Work</h2>
          <p>
            Members are accepted entirely on the originality and quality of their Proof of Work (real work or portfolio). Muara AI may reject an application or
            revoke membership if cheating, plagiarism or an ethics violation is found.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Voluntary Support</h2>
          <p>
            Membership is free of charge. Financial support is voluntary, through donations, and is used to pay for VPS server rental, domains and competition registration.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Intellectual Property & Open Source</h2>
          <p>
            Joint community projects are released under an official open-source licence (MIT License). Members keep the moral rights to the code and creative
            work they contribute.
          </p>
        </section>
      </div>
    </div>
  );
}
