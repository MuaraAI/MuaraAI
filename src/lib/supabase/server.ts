import { createServerClient } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
import { COOKIE_NAME, COOKIE_DOMAIN } from "../constants";

export async function createClient() {
  const cookieStore = await cookies();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be configured");
  }

  let cookieDomain: string | undefined = undefined;
  try {
    const headerList = await headers();
    const host = headerList.get("host") || "";
    if (host.includes("muaraai.com")) {
      cookieDomain = COOKIE_DOMAIN;
    }
  } catch {
    // headers() might not be available in certain contexts
  }

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: COOKIE_NAME,
      domain: cookieDomain,
      path: "/",
      sameSite: "lax",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
