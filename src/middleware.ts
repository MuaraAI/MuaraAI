import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { COOKIE_NAME, COOKIE_DOMAIN } from "@/lib/constants";
import { LOCALE_COOKIE, LOCALE_HEADER, localeFor } from "@/lib/locale";

export async function middleware(request: NextRequest) {
  // Server components read the document language from this header; it is always set here, never trusted from the client.
  const locale = localeFor(request.nextUrl.pathname, request.cookies.get(LOCALE_COOKIE)?.value);
  const forward = () => {
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, locale);
    return NextResponse.next({ request: { headers } });
  };

  let response = forward();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const hostname = request.nextUrl.hostname;
  const cookieDomain = hostname.endsWith("muaraai.com") ? COOKIE_DOMAIN : undefined;

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookieOptions: {
      name: COOKIE_NAME,
      domain: cookieDomain,
      path: "/",
      sameSite: "lax",
    },
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        response = forward();
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // Refresh auth session
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|woff2?)$).*)",
  ],
};
