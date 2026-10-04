import React from "react";
import { createClient } from "@/lib/supabase/server";
import { SentEmail, InboxMessage } from "@/types/database";
import AdminMailClient from "./admin-mail-client";

export default async function AdminMailPage() {
  const supabase = await createClient();

  const [inboxRes, sentRes] = await Promise.all([
    supabase
      .from("inbox_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("sent_emails")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const inboxMessages: InboxMessage[] = inboxRes.data || [];
  const sentEmails: SentEmail[] = sentRes.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Pusat Pesan & Email (Two-Way Mail Center)
        </h1>
        <p className="text-xs text-slate-500">
          Kelola pesan masuk dari mitra/perusahaan luar, balas via email resmi <code>admin@muaraai.com</code>, dan kirim broadcast pengumuman ke seluruh anggota.
        </p>
      </div>

      <AdminMailClient initialInboxMessages={inboxMessages} initialSentEmails={sentEmails} />
    </div>
  );
}
