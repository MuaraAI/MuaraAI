"use server";

import { createClient } from "@/lib/supabase/server";

export async function recordMaterialRead(materialId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("learning_material_reads")
    .upsert(
      {
        material_id: materialId,
        member_id: user.id,
        opened_at: new Date().toISOString(),
      },
      { onConflict: "material_id,member_id" }
    );

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
