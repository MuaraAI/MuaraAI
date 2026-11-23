import React from "react";
import { redirect } from "next/navigation";
import { getMaintainerClient } from "@/lib/supabase/admin";
import { Member } from "@/types/database";
import AdminMembersClient from "./admin-members-client";
import { PortalHeader } from "@/components/ui/section";

export default async function AdminMembersPage() {
  const admin = await getMaintainerClient();
  if (!admin) redirect("/dashboard");

  const { data: membersData } = await admin
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
