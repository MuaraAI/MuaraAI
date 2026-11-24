import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { createPrivilegedClient } from "@/lib/supabase/admin";
import { runContributionSync } from "@/lib/contributions/engine";
import { buildSupabaseDeps } from "@/lib/contributions/supabase-deps";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(request: Request, secret: string): boolean {
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  const expected = Buffer.from(`Bearer ${secret}`);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

/** Daily Vercel Cron entry point. Vercel sends `Authorization: Bearer $CRON_SECRET` automatically. */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET is not configured" }, { status: 500 });
  }
  if (!isAuthorized(request, secret)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await createPrivilegedClient();
    const summary = await runContributionSync(buildSupabaseDeps(client, { token: process.env.GITHUB_ORG_TOKEN }));
    return NextResponse.json({ ok: true, summary });
  } catch (error) {
    console.error("[cron:contributions]", error instanceof Error ? error.message : "unknown error");
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}
