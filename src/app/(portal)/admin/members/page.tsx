import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import AdminMembersClient from "./admin-members-client";
import { PortalHeader } from "@/components/ui/section";

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const { data: membersData } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  const members: Member[] = membersData || [];

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Audit Anggota & Status Akses">
          Pantau status keaktifan anggota dan kendalikan akses mereka.
      </PortalHeader>

      <AdminMembersClient initialMembers={members} />
    </div>
  );
}
