import React from "react";
import { redirect } from "next/navigation";
import { getMaintainerClient } from "@/lib/supabase/admin";
import { Member } from "@/types/database";
import ReviewQueueClient from "./review-queue-client";
import { PortalHeader } from "@/components/ui/section";

export default async function AdminReviewPage() {
  const admin = await getMaintainerClient();
  if (!admin) redirect("/dashboard");

  const { data: pendingMembers } = await admin
    .from("members")
    .select("*")
    .eq("registration_status", "pending")
    .order("created_at", { ascending: true });

  const members: Member[] = pendingMembers || [];

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Review pendaftar">
          Periksa profil, alasan bergabung, dan Proof of Work, lalu pilih keputusan untuk setiap pendaftar.
      </PortalHeader>

      <ReviewQueueClient initialMembers={members} />
    </div>
  );
}
