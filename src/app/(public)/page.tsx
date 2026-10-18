import React from "react";
import Hero from "@/components/landing/hero";
import MetricsBar from "@/components/landing/metrics-bar";
import NationalCampusMap from "@/components/landing/national-campus-map";
import VisionMission from "@/components/landing/vision-mission";
import ProjectsGrid from "@/components/landing/projects-grid";
import AccoladesGrid from "@/components/landing/accolades-grid";
import Manifesto from "@/components/landing/manifesto";
import SyndicateRoster from "@/components/landing/syndicate-roster";
import BenefitsGrid from "@/components/landing/benefits-grid";
import TreasuryPreview from "@/components/landing/treasury-preview";
import JoinFlow from "@/components/landing/join-flow";
import WaveDivider from "@/components/ui/wave-divider";
import { createClient } from "@/lib/supabase/server";
import { Member, Achievement } from "@/types/database";

export const revalidate = 60; // ISR 60 seconds

export default async function LandingPage() {
  const supabase = await createClient();

  // 1. Fetch approved active members (explicit public profile fields only, zero PII)
  const { data: membersData } = await supabase
    .from("members")
    .select("id, full_name, avatar_url, github_username, hierarchy, sub_hierarchy, roles, titles, division, track, total_commits, website_url, github_url, linkedin_url, portfolio_url")
    .eq("registration_status", "approved")
    .eq("is_active", true)
    .order("total_commits", { ascending: false });

  const members = (membersData || []) as unknown as Member[];

  // 2. Fetch achievements
  const { data: achievementsData } = await supabase
    .from("achievements")
    .select("*")
    .order("issue_date", { ascending: false });

  const achievements: Achievement[] = achievementsData || [];

  // 3. Fetch treasury aggregates
  const { data: transactionsData } = await supabase
    .from("treasury_transactions")
    .select("type, amount")
    .eq("status", "paid");

  let currentBalance = 0;
  let totalExpenses = 0;

  if (transactionsData) {
    transactionsData.forEach((tx) => {
      if (tx.type === "income") {
        currentBalance += tx.amount;
      } else if (tx.type === "expense") {
        currentBalance -= tx.amount;
        totalExpenses += tx.amount;
      }
    });
  }

  return (
    <div className="flex flex-col">
      <Hero />
      <MetricsBar />
      <NationalCampusMap />
      <WaveDivider />
      <VisionMission />
      <ProjectsGrid />
      <WaveDivider inverted />
      <AccoladesGrid initialAchievements={achievements} />
      <Manifesto />
      <WaveDivider />
      <SyndicateRoster initialMembers={members} />
      <BenefitsGrid />
      <WaveDivider inverted />
      <TreasuryPreview currentBalance={currentBalance} totalExpenses={totalExpenses} />
      <JoinFlow />
    </div>
  );
}
