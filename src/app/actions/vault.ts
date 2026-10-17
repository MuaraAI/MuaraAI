"use server";

import { createClient } from "@/lib/supabase/server";
import { encryptVaultCredential } from "@/lib/vault-crypto";

export type VaultProject = "ai" | "ubsi";

export interface SaveKeyInput {
  project: VaultProject;
  name: string;
  keyPrefix: string;
  keyHash: string;
  nim?: string;
  elearningPass?: string;
  studentv2Pass?: string;
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
    .select("id, registration_status, is_active, membership_status, reapply_blocked")
    .eq("id", user.id)
    .single();

  if (!member || member.registration_status !== "approved" || !member.is_active) {
    return {
      success: false,
      error: "Hanya anggota resmi yang aktif yang dapat membuat API key.",
    };
  }

  if (member.membership_status !== "active" || member.reapply_blocked === true) {
    return {
      success: false,
      error: "Akun membership ini tidak dapat membuat API key.",
    };
  }

  const tableName = input.project === "ai" ? "ai_api_keys" : "api_keys";

  const insertPayload: Record<string, unknown> = {
    user_id: user.id,
    key_prefix: input.keyPrefix,
    key_hash: input.keyHash,
    name: input.name.trim() || "Default",
    is_active: true,
  };

  if (input.project === "ubsi") {
    const nim = input.nim?.trim() || "";
    const elPass = input.elearningPass || "";
    const svPass = input.studentv2Pass || "";

    if (!nim || !elPass || !svPass) {
      return {
        success: false,
        error: "NIM, Password SIAKAD, dan Password MyBest (Elearning) wajib diisi untuk membuat UBSI API key.",
      };
    }

    // Optional pre-validation if UBSI API endpoint is configured
    const ubsiBaseUrl = process.env.UBSI_API_BASE_URL;
    const ubsiMasterKey = process.env.UBSI_API_MASTER_KEY;

    if (ubsiBaseUrl && ubsiMasterKey) {
      try {
        const verifyRes = await fetch(`${ubsiBaseUrl.replace(/\/$/, "")}/v1/auth/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-API-Key": ubsiMasterKey,
          },
          body: JSON.stringify({
            nim,
            elearning_pass: elPass,
            studentv2_pass: svPass,
          }),
        });

        if (verifyRes.ok) {
          const verifyData = await verifyRes.json();
          if (verifyData.data && !verifyData.data.valid) {
            const elMsg = verifyData.data.elearning?.message;
            const svMsg = verifyData.data.studentv2?.message;
            const errMsg = elMsg || svMsg || "Kredensial SIAKAD atau Elearning tidak valid di server kampus.";
            return { success: false, error: errMsg };
          }
        }
      } catch (err) {
        console.warn("[vault] Pre-validation ping failed, falling back to direct encryption:", err);
      }
    }

    const vaultKey = process.env.VAULT_ENCRYPTION_KEY;
    if (!vaultKey) {
      return {
        success: false,
        error: "Server configuration error: VAULT_ENCRYPTION_KEY belum disetel.",
      };
    }

    try {
      insertPayload.nim = nim;
      insertPayload.encrypted_elearning_pass = encryptVaultCredential(elPass, vaultKey);
      insertPayload.encrypted_studentv2_pass = encryptVaultCredential(svPass, vaultKey);
    } catch (encryptErr: any) {
      return {
        success: false,
        error: `Gagal mengenkripsi kredensial: ${encryptErr.message}`,
      };
    }
  }

  // Deactivate previous active keys for this user and project
  await supabase
    .from(tableName)
    .update({ is_active: false })
    .eq("user_id", user.id);

  const { data: inserted, error } = await supabase
    .from(tableName)
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, keyId: inserted?.id };
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
