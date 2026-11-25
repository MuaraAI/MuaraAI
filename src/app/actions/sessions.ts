"use server";

import { createClient } from "@/lib/supabase/server";
import { createPrivilegedClient, getMaintainerClient } from "@/lib/supabase/admin";
import { generateCode, isSessionOpen, normalizeCode, validateSessionInput, type SessionInput } from "@/lib/sessions/sessions";

const GENERIC_ERROR = "Terjadi kesalahan pada server. Silakan coba lagi.";
const CHECKIN_ERROR = "Kode tidak valid, atau sesi belum dibuka / sudah selesai.";
const FORBIDDEN = "Akses ditolak.";
const UNIQUE_VIOLATION = "23505";
const CODE_ATTEMPTS = 3;

const toRow = (value: SessionInput) => ({
  title: value.title,
  type: value.type,
  materi: value.materi,
  starts_at: value.startsAt,
  ends_at: value.endsAt,
  discord_url: value.discordUrl,
});

type Failure = { success: false; error: string };
const fail = (action: string, error: { message?: string }): Failure => {
  // Never return provider messages: they can contain table and row details.
  console.error(`[sessions:${action}]`, error.message ?? "unknown error");
  return { success: false, error: GENERIC_ERROR };
};

export async function createSession(input: unknown): Promise<{ success: true; id: string; code: string } | Failure> {
  const admin = await getMaintainerClient();
  if (!admin) return { success: false, error: FORBIDDEN };

  const parsed = validateSessionInput(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = generateCode();
    const { data, error } = await admin
      .from("discord_sessions")
      .insert({ ...toRow(parsed.value), checkin_code: code })
      .select("id")
      .single();
    if (!error && data) return { success: true, id: data.id as string, code };
    if (error?.code !== UNIQUE_VIOLATION) return fail("createSession", error ?? {});
  }
  return fail("createSession", { message: "check-in code kept colliding" });
}

export async function updateSession(id: string, input: unknown): Promise<{ success: true } | Failure> {
  const admin = await getMaintainerClient();
  if (!admin) return { success: false, error: FORBIDDEN };

  const parsed = validateSessionInput(input);
  if (!parsed.ok) return { success: false, error: parsed.error };

  const { error } = await admin.from("discord_sessions").update(toRow(parsed.value)).eq("id", String(id));
  return error ? fail("updateSession", error) : { success: true };
}

export async function deleteSession(id: string): Promise<{ success: true } | Failure> {
  const admin = await getMaintainerClient();
  if (!admin) return { success: false, error: FORBIDDEN };

  const { error } = await admin.from("discord_sessions").delete().eq("id", String(id));
  return error ? fail("deleteSession", error) : { success: true };
}

export async function regenerateCheckinCode(id: string): Promise<{ success: true; code: string } | Failure> {
  const admin = await getMaintainerClient();
  if (!admin) return { success: false, error: FORBIDDEN };

  for (let attempt = 0; attempt < CODE_ATTEMPTS; attempt += 1) {
    const code = generateCode();
    const { error } = await admin.from("discord_sessions").update({ checkin_code: code }).eq("id", String(id));
    if (!error) return { success: true, code };
    if (error.code !== UNIQUE_VIOLATION) return fail("regenerateCheckinCode", error);
  }
  return fail("regenerateCheckinCode", { message: "check-in code kept colliding" });
}

/**
 * Records the signed-in member's attendance when the code matches a session that is open right now.
 * Every code problem (unknown, too early, too late) answers with the same message so codes cannot be probed.
 */
export async function checkInToSession(code: unknown): Promise<{ success: boolean; error?: string; title?: string }> {
  const normalized = normalizeCode(code);
  if (!normalized) return { success: false, error: CHECKIN_ERROR };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Silakan masuk dulu." };

  const privileged = await createPrivilegedClient();
  const { data: member } = await privileged
    .from("members")
    .select("registration_status, membership_status, is_active")
    .eq("id", user.id)
    .maybeSingle();
  if (
    !member ||
    member.registration_status !== "approved" ||
    member.membership_status !== "active" ||
    member.is_active !== true
  ) {
    return { success: false, error: "Hanya anggota aktif yang bisa check-in." };
  }

  const { data: session } = await privileged
    .from("discord_sessions")
    .select("id, title, starts_at, ends_at")
    .eq("checkin_code", normalized)
    .maybeSingle();
  if (!session || !isSessionOpen({ startsAt: session.starts_at, endsAt: session.ends_at }, new Date())) {
    return { success: false, error: CHECKIN_ERROR };
  }

  const { error } = await privileged
    .from("session_attendance")
    .upsert({ session_id: session.id, member_id: user.id }, { onConflict: "session_id,member_id", ignoreDuplicates: true });
  if (error) return fail("checkInToSession", error);

  return { success: true, title: session.title as string };
}
