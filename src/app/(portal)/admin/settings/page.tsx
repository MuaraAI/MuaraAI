import React from "react";
import { createClient } from "@/lib/supabase/server";
import { POSITIONS_SETTING_KEY, parsePositions } from "@/lib/positions";
import { PortalHeader } from "@/components/ui/section";
import PositionsForm from "./positions-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", POSITIONS_SETTING_KEY)
    .single();

  const positions = parsePositions(data?.value) ?? { builder: [], creative: [] };

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Maintainer workspace" title="Pengaturan Komunitas">
        Atur daftar posisi resmi yang bisa dipilih pendaftar baru.
      </PortalHeader>

      <PositionsForm initial={positions} />
    </div>
  );
}
