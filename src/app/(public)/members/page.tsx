import React from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import MembersDirectory from "@/components/members/members-directory";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import { PageHeader } from "@/components/ui/section";

export const revalidate = 60; // ISR 60 seconds

export default async function MembersPage() {
  const supabase = isSupabaseConfigured() ? await createClient() : null;

  // Fetch all approved active members
  const { data: membersData } = supabase
    ? await supabase
    .from("members")
    .select(
      "id, full_name, avatar_url, github_username, hierarchy, sub_hierarchy, roles, titles, division, track, secondary_division, secondary_track, campus, tier, streak, website_url, github_url, linkedin_url, portfolio_url, bio, role_title"
    )
    .eq("registration_status", "approved")
    .eq("is_active", true)
    .order("tier", { ascending: false })
    .order("streak", { ascending: false })
    .order("full_name", { ascending: true })
    : { data: null };

  const members = (membersData || []) as unknown as Member[];

  const { data: positionsSetting } = supabase
    ? await supabase.from("community_settings").select("value").eq("key", POSITIONS_SETTING_KEY).single()
    : { data: null };
  const positions = parsePositions(positionsSetting?.value) ?? undefined;

  return (
    <div className="mx-auto max-w-[100rem] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
      <PageHeader
        eyebrow="Direktori Publik"
        title="Direktori Anggota Muara AI"
        description="Kenali anggota yang belajar, membangun project, dan berkontribusi bersama MuaraAI."
        actions={
          <Link href="/onboarding" className="px-btn inline-flex w-fit items-center gap-2 px-5 py-2.5 font-sans text-xs font-bold">
            <Icon name="github" className="h-4 w-4" />
            <span>Daftar dengan GitHub</span>
          </Link>
        }
      />

      {/* Directory Component */}
      <MembersDirectory initialMembers={members} positions={positions} />
    </div>
  );
}
