import React from "react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/ui/section";
import TranslationNote from "@/components/legal/translation-note";

export const metadata: Metadata = {
  title: "Privacy Policy | MuaraAI",
  description: "How Muara AI manages and protects the data you give us.",
  alternates: {
    canonical: "https://muaraai.com/en/privacy",
    languages: { id: "https://muaraai.com/privacy", en: "https://muaraai.com/en/privacy", "x-default": "https://muaraai.com/privacy" },
  },
};

export default function EnglishPrivacyPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Legal"
        home={{ label: "Home", href: "/en" }}
        title="Privacy Policy"
        description="How Muara AI manages and protects the data you give us."
      />

      <div className="space-y-6 text-sm leading-relaxed text-slate-600">
        <TranslationNote path="privacy" />

        <p>
          This privacy policy explains how Muara AI manages and protects the personal data you give us when you use the <strong>muaraai.com</strong> portal.
        </p>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">1. Data We Collect</h2>
          <p>We only collect data that is relevant to authentication, membership curation and contribution counting:</p>
          <ul className="list-disc pl-5 space-y-1 text-slate-600">
            <li>Your public GitHub identity (username, avatar, public email).</li>
            <li>Your full name, status (student, learner, general or other), institution (optional), WhatsApp number and Telegram username (optional).</li>
            <li>The reason for joining that you write.</li>
            <li>Your portfolio link and the description of your engineering toolchain.</li>
            <li>
              Your GitHub activity in the MuaraAI org: merged pull requests, the reviews that approved them, the number of commits inside those pull
              requests, and the repos you created. It is used to work out your monthly contribution target.
            </li>
            <li>Discord session attendance that you record through the web check-in.</li>
          </ul>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">2. Who Can See Your Data</h2>
          <p>
            The profile of an approved member is public and appears in the member directory: full name, GitHub avatar and username, division and position,
            status, institution (if given), the links you filled in, and your contribution tier, streak, cumulative commit total, and membership status (active or not, start and exit dates).
          </p>
          <p>
            Only you and the maintainers can see your email, WhatsApp number, Telegram username, reason for joining, toolchain description, per-month contribution numbers, warning
            status and Discord session attendance.
          </p>
          <p>
            When you apply, a summary of your application (name, status, institution, GitHub username, division and track, portfolio link and an excerpt of your reason for joining)
            is sent to the maintainers by email and in a Discord channel.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">3. Use & Security of Data</h2>
          <p>
            Your data is never sold to any third party. Data is stored and authenticated through Supabase (the database and Supabase Auth, with session
            tokens based on HTTP-only cookies), the site runs on Vercel, email is sent through Resend, login and contribution activity are read from GitHub,
            and notifications for the maintainers are sent through Discord. Columns that hold personal data are restricted at the database level so that
            they cannot be read publicly.
          </p>
        </section>

        <section className="px-card bg-white p-6 space-y-3">
          <h2 className="text-base font-semibold text-foreground">4. Access & Deletion</h2>
          <p>
            Members may update their profile or ask for their account to be deactivated and their personal data cleared by contacting the maintainers at{" "}
            <code>admin@muaraai.com</code>.
          </p>
        </section>
      </div>
    </div>
  );
}
