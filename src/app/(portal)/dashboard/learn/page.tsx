import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LearningMaterial } from "@/types/database";
import LearnFeedClient from "./learn-feed-client";
import Icon from "@/components/ui/icon";

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
      <div className="rounded-[18px] border border-stroke bg-white p-8 sm:p-12 text-center max-w-lg mx-auto shadow-diffusion space-y-4 my-8">
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
          <Icon name="lock" className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-xl text-foreground">Materi Belajar Terkunci</h2>
        <p className="text-xs text-secondary leading-relaxed">
          Ruang belajar hanya terbuka untuk anggota resmi yang sudah disetujui oleh Core Team. Status pendaftaran Anda saat ini masih dalam proses peninjauan.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-5 py-2.5 text-xs font-semibold text-white hover:bg-secondary transition-colors"
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
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Muara Learn (Knowledge Base)
        </h1>
        <p className="text-xs text-secondary font-sans">
          Materi riset internal, prompt harnesses, system design decks, dan panduan rekayasa yang dikurasi oleh Maintainer.
        </p>
      </div>

      <LearnFeedClient initialMaterials={materials} />
    </div>
  );
}
