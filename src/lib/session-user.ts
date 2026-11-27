import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isDevMockEnabled } from "@/lib/dev-mock";

/**
 * Who is signed in, so a page can show a Dashboard button instead of Masuk/Daftar.
 *
 * Display only: it reads the verified JWT claims (no network call, nothing is written) and never decides what someone may
 * do. Access is still checked by the portal layout and the database. Any failure just means "show the signed-out page".
 */
export async function getSessionUser(): Promise<{ id: string } | null> {
  if (!isSupabaseConfigured() && !isDevMockEnabled()) return null;
  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    const id = data?.claims?.sub;
    return id ? { id } : null;
  } catch {
    return null;
  }
}
