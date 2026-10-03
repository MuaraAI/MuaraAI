import { createBrowserClient } from "@supabase/ssr";
import { COOKIE_NAME, COOKIE_DOMAIN } from "../constants";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://awlwvcmrknkdxnwolcoy.supabase.co";
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: COOKIE_NAME,
      domain: process.env.NODE_ENV === "production" ? COOKIE_DOMAIN : undefined,
      path: "/",
      sameSite: "lax",
    },
  });
}
