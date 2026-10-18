import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

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

        if (member && (member.registration_status === "approved" || member.registration_status === "pending")) {
          return NextResponse.redirect(`${requestUrl.origin}/dashboard`);
        } else {
          // Needs to submit Proof of Work
          return NextResponse.redirect(`${requestUrl.origin}/onboarding`);
        }
      }
    }
  }

  return NextResponse.redirect(`${requestUrl.origin}/`);
}
