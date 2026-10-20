import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import ReviewQueueClient from "./review-queue-client";
import { PortalHeader } from "@/components/ui/section";

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
      <PortalHeader eyebrow="Maintainer workspace" title="Review pendaftar">
          Periksa identitas kampus dan Proof of Work, lalu pilih keputusan untuk setiap pendaftar.
      </PortalHeader>

      <ReviewQueueClient initialMembers={members} />
    </div>
  );
}
