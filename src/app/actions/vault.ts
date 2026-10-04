"use server";

import { createClient } from "@/lib/supabase/server";

export type VaultProject = "ai" | "ubsi";

export interface SaveKeyInput {
  project: VaultProject;
  name: string;
  keyPrefix: string;
  keyHash: string;
  nim?: string;
}

export async function saveApiKey(input: SaveKeyInput) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Check approved member
  const { data: member } = await supabase
    .from("members")
    .select("id, registration_status, is_active")
    .eq("id", user.id)
    .single();

  if (!member || member.registration_status !== "approved" || !member.is_active) {
    return {
      success: false,
      error: "Hanya anggota resmi yang aktif yang dapat membuat API key.",
    };
  }

  const tableName = input.project === "ai" ? "ai_api_keys" : "api_keys";

  // Deactivate previous active keys for this user and project if needed
  await supabase
    .from(tableName)
    .update({ is_active: false })
    .eq("user_id", user.id);

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    key_prefix: input.keyPrefix,
    key_hash: input.keyHash,
    name: input.name.trim() || "Default",
    is_active: true,
  };

  if (input.project === "ubsi" && input.nim) {
    insertPayload.nim = input.nim.trim();
  }

  const { error } = await supabase.from(tableName).insert(insertPayload);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function revokeApiKey(project: VaultProject, keyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const tableName = project === "ai" ? "ai_api_keys" : "api_keys";

  const { error } = await supabase
    .from(tableName)
    .update({ is_active: false })
    .eq("id", keyId)
    .eq("user_id", user.id);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
