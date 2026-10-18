import React from "react";
import PoWForm from "@/components/auth/pow-modal";
import { createClient } from "@/lib/supabase/server";

export default async function OnboardingPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="py-16 px-4 sm:px-6 lg:px-8">
      <PoWForm authenticated={Boolean(user)} />
    </div>
  );
}
