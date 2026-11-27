import React from "react";
import Hero from "@/components/landing/hero";
import MetricsBar from "@/components/landing/metrics-bar";
import VisionMission from "@/components/landing/vision-mission";
import ProjectsGrid from "@/components/landing/projects-grid";
import AccoladesGrid from "@/components/landing/accolades-grid";
import Manifesto from "@/components/landing/manifesto";
import SyndicateRoster from "@/components/landing/syndicate-roster";
import CommunityStructure from "@/components/landing/community-structure";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import BenefitsGrid from "@/components/landing/benefits-grid";
import DonateCta from "@/components/landing/donate-cta";
import JoinFlow from "@/components/landing/join-flow";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Member, Achievement } from "@/types/database";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = { alternates: { canonical: "https://muaraai.com/", languages: { id: "https://muaraai.com/", en: "https://muaraai.com/en", "x-default": "https://muaraai.com/" } } };

export const revalidate = 60; // ISR 60 seconds

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string; next?: string; error?: string }>;
}) {
  const params = await searchParams;

  // Some OAuth providers can return to the configured site URL instead of the
  // application callback. Forward the code to the same exchange handler.
  if (params.code) {
    const callback = new URL("/api/auth/callback", "https://muaraai.com");
    callback.searchParams.set("code", params.code);
    if (params.next?.startsWith("/") && !params.next.startsWith("//")) {
      callback.searchParams.set("next", params.next);
    }
    redirect(callback.pathname + callback.search);
  }

  if (params.error) {
    redirect(`/onboarding?error=${encodeURIComponent(params.error)}`);
  }

  // Without Supabase env (e.g. fresh local clone) render the static landing with empty data.
  const supabase = isSupabaseConfigured() ? await createClient() : null;

  // 1. Fetch approved active members (explicit public profile fields only, zero PII)
  const { data: membersData } = supabase
    ? await supabase
    .from("members")
    .select("id, full_name, avatar_url, github_username, hierarchy, sub_hierarchy, roles, titles, division, divisions, head_of, tracks, track, tier, streak, website_url, github_url, linkedin_url, portfolio_url")
    .eq("registration_status", "approved")
    .eq("is_active", true)
    .order("tier", { ascending: false })
    .order("streak", { ascending: false })
    .order("full_name", { ascending: true })
    : { data: null };

  const members = (membersData || []) as unknown as Member[];

  // 2. Fetch achievements
  const { data: achievementsData } = supabase
    ? await supabase
    .from("achievements")
    .select("*")
    .order("issue_date", { ascending: false })
    : { data: null };

  const achievements: Achievement[] = achievementsData || [];

  const { data: positionsSetting } = supabase
    ? await supabase.from("community_settings").select("value").eq("key", POSITIONS_SETTING_KEY).maybeSingle()
    : { data: null };
  const positions = parsePositions(positionsSetting?.value);

  return (
    <div className="flex flex-col">
      <Hero />
      <MetricsBar />
      <VisionMission />
      <ProjectsGrid />
      <AccoladesGrid initialAchievements={achievements} />
      <Manifesto />
      <CommunityStructure positions={positions} />
      <SyndicateRoster initialMembers={members} />
      <BenefitsGrid />
      <DonateCta />
      <JoinFlow />
    </div>
  );
}
