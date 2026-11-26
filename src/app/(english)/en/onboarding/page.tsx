import React from "react";
import type { Metadata } from "next";
import OnboardingView from "@/components/auth/onboarding-view";

export const metadata: Metadata = {
  title: "Join MuaraAI | Registration form",
  description: "Create your community profile and send your Proof of Work to the MuaraAI team.",
  alternates: {
    canonical: "https://muaraai.com/en/onboarding",
    languages: { id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding", "x-default": "https://muaraai.com/onboarding" },
  },
};

export default async function EnglishOnboardingPage() {
  return OnboardingView({ locale: "en" });
}
