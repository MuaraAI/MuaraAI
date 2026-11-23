import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LearningMaterial } from "@/types/database";
import LearnFeedClient from "./learn-feed-client";
import Icon from "@/components/ui/icon";
import { PortalHeader } from "@/components/ui/section";

export default async function MemberLearnPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: member } = await supabase
    .from("members")
    .select("registration_status")
    .eq("id", user?.id)
    .maybeSingle();

  if (member?.registration_status !== "approved") {
    return (
      <div className="px-card bg-white p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 my-8">
        <div className="mx-auto w-12 h-12 bg-slate-100 flex items-center justify-center text-slate-500">
          <Icon name="lock" className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground">Materi Belajar Terkunci</h2>
        <p className="text-xs text-secondary leading-relaxed">
          Ruang belajar hanya terbuka untuk anggota resmi yang sudah disetujui oleh Core Team. Status pendaftaran Anda saat ini masih dalam proses peninjauan.
        </p>
        <Link
          href="/dashboard"
          className="px-btn inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-xs font-semibold transition-colors"
        >
          Kembali ke Beranda Dashboard
        </Link>
      </div>
    );
  }

  // Fetch learning materials
  const { data: materialsData } = await supabase
    .from("learning_materials")
    .select("*")
    .order("created_at", { ascending: false });

  const materials: LearningMaterial[] = materialsData || [];

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Member workspace" title="Muara Learn (Knowledge Base)">
          Materi riset internal, prompt harnesses, system design decks, dan panduan rekayasa yang dikurasi oleh Maintainer.
      </PortalHeader>

      <LearnFeedClient initialMaterials={materials} />
    </div>
  );
}
