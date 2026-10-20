import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Achievement } from "@/types/database";
import AdminAchievementsClient from "./admin-achievements-client";
import { PortalHeader } from "@/components/ui/section";

export default async function AdminAchievementsPage() {
  const supabase = await createClient();

  const { data: achievementsData } = await supabase
    .from("achievements")
    .select("*")
    .order("issue_date", { ascending: false });

  const achievements: Achievement[] = achievementsData || [];

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Manajemen Prestasi & Sertifikat Resmi">
          Unggah sertifikat kejuaraan hackathon, delegasi lomba nasional, dan sertifikasi profesional untuk etalase publik The Accolades.
      </PortalHeader>

      <AdminAchievementsClient initialAchievements={achievements} />
    </div>
  );
}
