import { NextResponse } from "next/server";
import { DEV_MOCK_COOKIE, isDevMockEnabled, type DevRole } from "@/lib/dev-mock";

/** Dev-only quick login for the local dummy-data mode. Returns 404 everywhere else. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isDevMockEnabled()) {
    return new NextResponse("Not found", { status: 404 });
  }

  const role = url.searchParams.get("as") as DevRole | null;
  if (role !== "admin" && role !== "member") {
    return NextResponse.redirect(`${url.origin}/login`);
  }

  const response = NextResponse.redirect(`${url.origin}${role === "admin" ? "/admin/review" : "/dashboard"}`);
  response.cookies.set(DEV_MOCK_COOKIE, role, { httpOnly: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
