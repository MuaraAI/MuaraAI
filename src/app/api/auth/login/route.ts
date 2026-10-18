import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const next = requestUrl.searchParams.get("next");
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
    return NextResponse.redirect(`${requestUrl.origin}/?error=oauth_failed`);
  }

  return NextResponse.redirect(data.url);
}
