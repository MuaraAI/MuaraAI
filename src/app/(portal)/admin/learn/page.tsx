import React from "react";
import { createClient } from "@/lib/supabase/server";
import { LearningMaterial } from "@/types/database";
import AdminLearnClient from "./admin-learn-client";
import { PortalHeader } from "@/components/ui/section";

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
      <PortalHeader eyebrow="Maintainer workspace" title="Manajemen Muara Learn & Audit Pembaca">
          Terbitkan materi rekayasa baru dan pantau siapa saja anggota yang telah mengakses dan membaca materi tersebut.
      </PortalHeader>

      <AdminLearnClient initialMaterials={materials} initialReads={reads} />
    </div>
  );
}
