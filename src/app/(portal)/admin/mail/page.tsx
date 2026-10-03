import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SentEmail } from "@/types/database";
import AdminMailClient from "./admin-mail-client";

export default async function AdminMailPage() {
  const supabase = await createClient();

  const { data: sentData } = await supabase
    .from("sent_emails")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(30);

  const sentEmails: SentEmail[] = sentData || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-white mb-1">
          Resend Mail Center (Maintainer Console)
        </h1>
        <p className="text-xs text-slate-400">
          Kirim email broadcast pengumuman atau pesan langsung ke anggota komunitas menggunakan Resend API dari <code>admin@muaraai.com</code>.
        </p>
      </div>

      <AdminMailClient initialSentEmails={sentEmails} />
    </div>
  );
}
