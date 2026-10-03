import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import AdminMembersClient from "./admin-members-client";

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const { data: membersData } = await supabase
    .from("members")
    .select("*")
    .order("created_at", { ascending: false });

  const members: Member[] = membersData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
          Audit Anggota & Manajemen Blacklist
        </h1>
        <p className="text-xs text-slate-400">
          Pantau status keaktifan anggota, masa aktif iuran kas, dan kendalikan status blacklist jika menunggak lebih dari 30 hari.
        </p>
      </div>

      <AdminMembersClient initialMembers={members} />
    </div>
  );
}
