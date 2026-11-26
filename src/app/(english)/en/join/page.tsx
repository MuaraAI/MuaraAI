import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/section";

export const metadata: Metadata = {
  title: "Join MuaraAI | How membership works",
  description: "Sign in with GitHub, fill in the registration form, and start contributing once a maintainer approves you.",
  alternates: {
    canonical: "https://muaraai.com/en/join",
    languages: { id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/join", "x-default": "https://muaraai.com/onboarding" },
  },
  openGraph: {
    title: "Join MuaraAI | How membership works",
    description: "Sign in with GitHub, fill in the registration form, and start contributing once a maintainer approves you.",
    url: "https://muaraai.com/en/join",
    siteName: "MuaraAI",
    locale: "en_US",
    type: "website",
    images: [{ url: "/brand/muara-logo.png", width: 512, height: 512, alt: "MuaraAI logo" }],
  },
  twitter: {
    card: "summary",
    title: "Join MuaraAI | How membership works",
    description: "Sign in with GitHub, fill in the registration form, and start contributing once a maintainer approves you.",
    images: ["/brand/muara-logo.png"],
  },
};

const STEPS = [
  {
    title: "Continue with GitHub",
    text: "You sign in with your GitHub account. There is no password and no email link.",
  },
  {
    title: "Fill in the registration form",
    text: "You give your name and WhatsApp number (Telegram is optional), choose a status (student, learner, general or other) and an optional institution, link a repository or portfolio, pick your division and position (and an optional second division), describe the tools you use, and tell us why you want to join in at least 50 characters.",
  },
  {
    title: "Wait for a review",
    text: "A maintainer reviews your application. Once it is approved, your GitHub account is invited to the MuaraAI organisation.",
  },
  {
    title: "Start contributing",
    text: "Pick a repository and open a pull request. Merged pull requests approved by someone other than the author count toward your monthly target.",
  },
];

export default async function EnglishJoinPage() {
  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Join"
        home={{ label: "Home", href: "/en" }}
        title="Join MuaraAI"
        description="Membership is open to anyone with a GitHub account. This is what happens, step by step."
        actions={
          <Link href="/api/auth/login?next=/en/onboarding" className="px-btn inline-flex w-fit items-center gap-2 px-5 py-2.5 text-xs font-bold">
            <Icon name="github" className="h-4 w-4" />
            <span>Continue with GitHub</span>
          </Link>
        }
      />

      <ol className="max-w-3xl space-y-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-5">
            <span className="font-mono text-sm font-bold text-muara-ocean" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">{step.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-secondary">{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-12 max-w-3xl text-sm leading-relaxed text-secondary">
        Read the{" "}
        <Link href="/code-of-conduct" className="font-semibold text-muara-ocean hover:underline">Code of Conduct</Link>{" "}
        before you apply. The Privacy Policy, Terms of Service and Code of Conduct you agree to are currently only available in Indonesian.
      </p>
    </div>
  );
}
