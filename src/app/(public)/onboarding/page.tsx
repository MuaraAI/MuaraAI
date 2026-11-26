import React from "react";
import type { Metadata } from "next";
import OnboardingView from "@/components/auth/onboarding-view";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://muaraai.com/onboarding",
    languages: { id: "https://muaraai.com/onboarding", en: "https://muaraai.com/en/onboarding", "x-default": "https://muaraai.com/onboarding" },
  },
};

export default async function OnboardingPage() {
  return OnboardingView({ locale: "id" });
}
