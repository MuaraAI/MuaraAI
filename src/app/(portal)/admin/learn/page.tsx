import React from "react";
import { createClient } from "@/lib/supabase/server";
import { LearningMaterial } from "@/types/database";
import AdminLearnClient from "./admin-learn-client";

export default async function AdminLearnPage() {
  const supabase = await createClient();

  const { data: materialsData } = await supabase
    .from("learning_materials")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch reads with member profiles
  const { data: readsData } = await supabase
    .from("learning_material_reads")
    .select("*, members(full_name, github_username)")
    .order("opened_at", { ascending: false });

  const materials: LearningMaterial[] = materialsData || [];
  const reads = readsData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Manajemen Muara Learn & Audit Pembaca
        </h1>
        <p className="text-xs text-secondary font-sans">
          Terbitkan materi rekayasa baru dan pantau siapa saja anggota yang telah mengakses dan membaca materi tersebut.
        </p>
      </div>

      <AdminLearnClient initialMaterials={materials} initialReads={reads} />
    </div>
  );
}
