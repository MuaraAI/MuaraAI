import React from "react";
import { redirect } from "next/navigation";
import PoWForm from "@/components/auth/pow-modal";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const { data: member } = await supabase
      .from("members")
      .select("id, registration_status")
      .eq("id", user.id)
      .maybeSingle();

    if (member?.registration_status === "approved" || member?.registration_status === "pending") {
      redirect("/dashboard");
    }
  }

  const githubUsername = user
    ? user.user_metadata?.user_name || user.user_metadata?.preferred_username
    : undefined;

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <PoWForm authenticated={Boolean(user)} githubUsername={githubUsername} />
    </div>
  );
}
