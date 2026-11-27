import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import PortalShell from "@/components/portal/portal-shell";
import { isMaintainer } from "@/lib/guards";
import { currentLocale } from "@/lib/locale-server";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await currentLocale();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: memberData } = await supabase
    .from("members")
    .select("id, full_name, github_username, is_active, registration_status, membership_status, reapply_blocked, hierarchy, roles")
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
    // Signed in with GitHub but not applied yet: they are inside the portal and apply from the dashboard.
    const meta = user.user_metadata ?? {};
    const github: string = meta.user_name || meta.preferred_username || "";
    return (
      <PortalShell
        locale={locale}
        member={{ full_name: meta.full_name || meta.name || github || "GitHub", github_username: github, is_active: true, registration_status: "applicant", is_maintainer: false }}
      >
        {children}
      </PortalShell>
    );
  }

  return (
    <PortalShell
      locale={locale}
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
