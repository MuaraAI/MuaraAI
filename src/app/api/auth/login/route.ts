import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { isDevMockEnabled } from "@/lib/dev-mock";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next");

  // Without OAuth available (no Supabase keys, or the local dummy mode) send people to the login page instead of a 500.
  if (!isSupabaseConfigured() || isDevMockEnabled()) {
    return NextResponse.redirect(`${requestUrl.origin}/login${isSupabaseConfigured() ? "" : "?error=not_configured"}`);
  }

  const supabase = await createClient();

  const redirectTo = next
    ? `${requestUrl.origin}/api/auth/callback?next=${encodeURIComponent(next)}`
    : `${requestUrl.origin}/api/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "github",
    options: {
      redirectTo,
    },
  });

  if (error || !data.url) {
    return NextResponse.redirect(`${requestUrl.origin}/login?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
