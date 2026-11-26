import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEV_MOCK_COOKIE } from "@/lib/dev-mock";
import { LOCALE_COOKIE } from "@/lib/locale";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  // Only the exact value "en" sends the member to the English site; anything else goes to the Indonesian home.
  const english = new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=en(?:;|$)`).test(request.headers.get("cookie") ?? "");
  const response = NextResponse.redirect(`${origin}${english ? "/en" : "/"}`);
  response.cookies.delete(DEV_MOCK_COOKIE);
  return response;
}
