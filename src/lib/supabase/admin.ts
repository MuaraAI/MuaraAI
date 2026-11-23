import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "./server";
import { isDevMockEnabled } from "../dev-mock";
import { isMaintainer } from "../guards";

/**
 * Service-role client. It bypasses RLS and column grants, so call it ONLY after authorizing
 * the caller in code (own row, or a verified maintainer), and never from a client component.
 */
export async function createPrivilegedClient(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    // Local dummy-data mode (dev only) has no service key; reuse its mock client.
    if (isDevMockEnabled()) return (await createClient()) as unknown as SupabaseClient;
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured");
  }

  return createSupabaseClient(url, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Returns the privileged client only for a signed-in maintainer, otherwise null. */
export async function getMaintainerClient(): Promise<SupabaseClient | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: member } = await supabase
    .from("members")
    .select("hierarchy, roles")
    .eq("id", user.id)
    .maybeSingle();

  return isMaintainer(member) ? createPrivilegedClient() : null;
}
