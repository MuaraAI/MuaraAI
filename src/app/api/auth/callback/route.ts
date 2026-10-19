import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        // Check member profile
        const { data: member } = await supabase
          .from("members")
          .select("id, registration_status")
          .eq("id", user.id)
          .maybeSingle();

        if (member) {
          // Every existing member, including pending and rejected users, enters
          // the dashboard. The dashboard renders the correct locked/status UI.
          const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
          return NextResponse.redirect(`${requestUrl.origin}${target}`);
        }

        // Only a GitHub account without a member profile needs onboarding.
        return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
      }
    }
  }

  const error = requestUrl.searchParams.get("error_description") || requestUrl.searchParams.get("error");
  const target = error
    ? `/onboarding?error=${encodeURIComponent(error)}`
    : "/onboarding?error=oauth_callback_failed";
  return NextResponse.redirect(`${requestUrl.origin}${target}`);
}
