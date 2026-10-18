import React from "react";
import { redirect } from "next/navigation";
import PoWForm from "@/components/auth/pow-modal";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let initialData = undefined;
  let rejectionReason: string | undefined = undefined;

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("id, registration_status, full_name, nim, campus, prodi, kelas, phone_wa, portfolio_url, division, track, toolchain_narrative, website_url, linkedin_url, instagram_url, threads_url, x_url, rejection_reason, reviewed_at, updated_at, created_at")
      .eq("id", user.id)
      .maybeSingle();

    if (member?.registration_status === "approved" || member?.registration_status === "pending") {
      redirect("/dashboard");
    }

    if (member?.registration_status === "rejected") {
      const rawTime = member.reviewed_at || member.updated_at || member.created_at;
      const rejectionTimestamp = rawTime ? new Date(rawTime).getTime() : 0;
      const cooldownMs = 24 * 60 * 60 * 1000;
      const canReapply = Date.now() >= rejectionTimestamp + cooldownMs;

      if (!canReapply) {
        redirect("/dashboard");
      }

      rejectionReason = member.rejection_reason || undefined;
      initialData = {
        fullName: member.full_name || "",
        nim: member.nim || "",
        campus: member.campus || "",
        prodi: member.prodi || "",
        kelas: member.kelas || "",
        phoneWa: member.phone_wa || "",
        division: (member.division as "builder" | "creative") || "builder",
        track: member.track || "Full-stack Web & AI App",
        toolchainNarrative: member.toolchain_narrative || "",
        portfolioUrl: member.portfolio_url || "",
        websiteUrl: member.website_url || "",
        linkedinUrl: member.linkedin_url || "",
        instagramUrl: member.instagram_url || "",
        threadsUrl: member.threads_url || "",
        xUrl: member.x_url || "",
      };
    }
  }

  const githubUsername = user
    ? user.user_metadata?.user_name || user.user_metadata?.preferred_username
    : undefined;

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <PoWForm
        authenticated={Boolean(user)}
        githubUsername={githubUsername}
        initialData={initialData}
        rejectionReason={rejectionReason}
      />
    </div>
  );
}
