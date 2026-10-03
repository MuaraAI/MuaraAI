import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import ReviewQueueClient from "./review-queue-client";

export default async function AdminReviewPage() {
  const supabase = await createClient();

  const { data: pendingMembers } = await supabase
    .from("members")
    .select("*")
    .eq("registration_status", "pending")
    .order("created_at", { ascending: true });

  const members: Member[] = pendingMembers || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
          Review Antrean Pendaftar
        </h1>
        <p className="text-xs text-slate-400">
          Tinjau berkas Proof of Work calon anggota. Klik Approve untuk menyetujui sekaligus mengundang ke GitHub Org MuaraAI secara otomatis.
        </p>
      </div>

      <ReviewQueueClient initialMembers={members} />
    </div>
  );
}
