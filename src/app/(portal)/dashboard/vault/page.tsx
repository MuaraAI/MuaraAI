import React from "react";
import { createClient } from "@/lib/supabase/server";
import VaultClient, { KeyItem } from "./vault-client";

export default async function DashboardVaultPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let aiKeys: KeyItem[] = [];
  let ubsiKeys: KeyItem[] = [];

  if (user) {
    const { data: aiData } = await supabase
      .from("ai_api_keys")
      .select("id, name, key_prefix, is_active, created_at, last_used_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    aiKeys = (aiData || []) as KeyItem[];

    const { data: ubsiData } = await supabase
      .from("api_keys")
      .select("id, name, key_prefix, is_active, created_at, last_used_at, nim")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    ubsiKeys = (ubsiData || []) as KeyItem[];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Vault & API Keys Generator
        </h1>
        <p className="text-xs text-slate-500">
          Pusat pembuatan dan pengelolaan kunci API resmi ekosistem Muara AI (Muara AI Gateway dan UBSI API).
        </p>
      </div>

      <VaultClient initialAiKeys={aiKeys} initialUbsiKeys={ubsiKeys} />
    </div>
  );
}
