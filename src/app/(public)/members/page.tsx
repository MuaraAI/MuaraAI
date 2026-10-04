import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import MembersDirectory from "@/components/members/members-directory";
import Link from "next/link";
import Icon from "@/components/ui/icon";

export const revalidate = 60; // ISR 60 seconds

export default async function MembersPage() {
  const supabase = await createClient();

  // Fetch all approved active members
  const { data: membersData } = await supabase
    .from("members")
    .select(
      "id, full_name, avatar_url, github_username, hierarchy, sub_hierarchy, roles, titles, division, track, total_commits, website_url, github_url, linkedin_url, portfolio_url, bio, role_title"
    )
    .eq("registration_status", "approved")
    .eq("is_active", true)
    .order("total_commits", { ascending: false });

  const members = (membersData || []) as unknown as Member[];

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-muara-ocean uppercase tracking-wider mb-2">
            <Link href="/" className="hover:underline flex items-center gap-1">
              <Icon name="arrow_back" className="w-3.5 h-3.5" />
              <span>Beranda</span>
            </Link>
            <span>/</span>
            <span>Roster Direktori</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Direktori Anggota Muara AI
          </h1>
          <p className="text-xs text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Daftar pengembang perangkat lunak, arsitek sistem AI, dan desainer visual yang tergabung dalam sindikat rekayasa teknologi Muara AI.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="inline-flex items-center gap-2 rounded-lg bg-muara-ocean hover:bg-muara-ocean-dark text-white px-5 py-2.5 text-xs font-bold font-sans transition-all shadow-sm shrink-0 w-fit"
        >
          <Icon name="person_add" className="w-4 h-4" />
          <span>Gabung Sindikat (PoW)</span>
        </Link>
      </div>

      {/* Directory Component */}
      <MembersDirectory initialMembers={members} />
    </div>
  );
}
