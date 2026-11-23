import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import PortalShell from "@/components/portal/portal-shell";
import { isMaintainer } from "@/lib/guards";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const member = memberData as Member | null;

  if (member?.membership_status === "exited" || member?.reapply_blocked) {
    redirect("/membership-exit");
  }
  if (member?.membership_status === "banned") {
    redirect("/membership-exit?status=banned");
  }
  if (!member) {
    redirect("/onboarding");
  }

  return (
    <PortalShell
      member={{
        full_name: member.full_name,
        github_username: member.github_username,
        is_active: member.is_active,
        registration_status: member.registration_status,
        is_maintainer: isMaintainer(member),
      }}
    >
      {children}
    </PortalShell>
  );
}
