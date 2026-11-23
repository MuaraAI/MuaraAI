import { NextResponse } from "next/server";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { DEV_MOCK_COOKIE } from "@/lib/dev-mock";

export async function GET(request: Request) {
  const { origin } = new URL(request.url);
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }
  const response = NextResponse.redirect(`${origin}/`);
  response.cookies.delete(DEV_MOCK_COOKIE);
  return response;
}
