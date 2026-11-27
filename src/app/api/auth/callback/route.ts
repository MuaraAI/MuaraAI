import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/locale";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next");
  // Only the exact English form path switches language; any other next value for a new account is ignored.
  const english = next === "/en/onboarding";
  // The member portal has no /en URLs, so remember the language the applicant came in with.
  const redirectTo = (target: string) => {
    const response = NextResponse.redirect(`${requestUrl.origin}${target}`);
    if (english) response.cookies.set(LOCALE_COOKIE, "en", { path: "/", maxAge: ONE_YEAR_SECONDS, sameSite: "lax" });
    return response;
  };

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
          .select("id, registration_status, github_username")
          .eq("id", user.id)
          .maybeSingle();

        if (member) {
          // Every existing member, including pending and rejected users, enters
          // the dashboard. The dashboard renders the correct locked/status UI.
          const target = next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
          return redirectTo(target);
        }

        // A GitHub account without a member profile has just signed in: it applies for membership inside the dashboard.
        return redirectTo("/dashboard");
      }
    }
  }

  // Any failure goes to the login page (never back to the form), so a failing sign-in can not loop.
  return redirectTo("/login?error=oauth_failed");
}
