import React from "react";
import { createClient } from "@/lib/supabase/server";
import { LearningMaterial } from "@/types/database";
import LearnFeedClient from "./learn-feed-client";

export default async function MemberLearnPage() {
  const supabase = await createClient();

  // Fetch learning materials
  const { data: materialsData } = await supabase
    .from("learning_materials")
    .select("*")
    .order("created_at", { ascending: false });

  const materials: LearningMaterial[] = materialsData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
          Muara Learn (Knowledge Base)
        </h1>
        <p className="text-xs text-slate-400">
          Materi riset internal, prompt harnesses, system design decks, dan panduan rekayasa yang dikurasi oleh Maintainer.
        </p>
      </div>

      <LearnFeedClient initialMaterials={materials} />
    </div>
  );
}
