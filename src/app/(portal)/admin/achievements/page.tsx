import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Achievement } from "@/types/database";
import AdminAchievementsClient from "./admin-achievements-client";

export default async function AdminAchievementsPage() {
  const supabase = await createClient();

  const { data: achievementsData } = await supabase
    .from("achievements")
    .select("*")
    .order("issue_date", { ascending: false });

  const achievements: Achievement[] = achievementsData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Manajemen Prestasi & Sertifikat Resmi
        </h1>
        <p className="text-xs text-secondary font-sans">
          Unggah sertifikat kejuaraan hackathon, delegasi lomba nasional, dan sertifikasi profesional untuk etalase publik The Accolades.
        </p>
      </div>

      <AdminAchievementsClient initialAchievements={achievements} />
    </div>
  );
}
