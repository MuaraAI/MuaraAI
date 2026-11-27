import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MembershipExitClient from "@/components/portal/membership-exit-client";
import { getEarliestExitDate } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";
import { currentLocale } from "@/lib/locale-server";

export default async function MembershipExitPage() {
  const locale = await currentLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("members")
    .select("membership_status, membership_started_at, exited_at, reapply_blocked")
    .eq("id", user.id)
    .maybeSingle();
  // Someone who has not applied has no membership to leave: they apply from the dashboard.
  if (!member) redirect("/dashboard");

  const { data: setting } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .maybeSingle();

  const policy = setting?.value as MembershipIntakePolicy | undefined;
  const earliestExitAt = policy
    ? getEarliestExitDate(member.membership_started_at, policy.minimum_active_days_before_exit)?.toISOString() ?? null
    : null;

  return (
    <main className="min-h-screen bg-background px-4 py-12 text-foreground sm:px-6">
      <div className="mx-auto max-w-xl">
        <MembershipExitClient
          status={member.membership_status}
          exitedAt={member.exited_at}
          earliestExitAt={earliestExitAt}
          locale={locale}
        />
      </div>
    </main>
  );
}
