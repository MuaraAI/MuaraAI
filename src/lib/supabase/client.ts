import { createBrowserClient } from "@supabase/ssr";
import { COOKIE_NAME, COOKIE_DOMAIN } from "../constants";

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured");
  }

  const hostname = typeof window !== "undefined" ? window.location.hostname : "";
  const cookieDomain = hostname.endsWith("muaraai.com") ? COOKIE_DOMAIN : undefined;

  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: COOKIE_NAME,
      domain: cookieDomain,
      path: "/",
      sameSite: "lax",
    },
  });
}
