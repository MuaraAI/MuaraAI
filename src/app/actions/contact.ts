"use server";

import { createClient } from "@/lib/supabase/server";
import { notifyMaintainers } from "@/lib/notify";

export interface ContactSubmissionInput {
  senderName: string;
  senderEmail: string;
  organization?: string;
  subject: string;
  message: string;
}

export async function submitContactMessage(input: ContactSubmissionInput) {
  const name = input.senderName?.trim();
  const email = input.senderEmail?.trim();
  const org = input.organization?.trim() || null;
  const subject = input.subject?.trim();
  const message = input.message?.trim();

  if (!name || name.length < 2) {
    return { success: false, error: "Nama pengirim minimal 2 karakter." };
  }
  if (!email || !email.includes("@") || !email.includes(".")) {
    return { success: false, error: "Alamat email tidak valid." };
  }
  if (!subject || subject.length < 3) {
    return { success: false, error: "Perihal/subjek minimal 3 karakter." };
  }
  if (!message || message.length < 10) {
    return { success: false, error: "Isi pesan minimal 10 karakter." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("inbox_messages").insert({
    sender_name: name,
    sender_email: email,
    organization: org,
    subject,
    message,
    status: "unread",
  });

  if (error) {
    console.error("[contact:submitContactMessage]", error.message);
    return { success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }

  // Multi-channel notification to maintainers
  const orgLabel = org ? `[${org}] ` : "";
  const alertText = `Dari: ${name} ${orgLabel}(${email})\nPerihal: ${subject}\n\n"${message.slice(0, 300)}${message.length > 300 ? "..." : ""}"`;

  try {
    await notifyMaintainers(`Pesan Kemitraan: ${subject}`, alertText);
  } catch (notifyErr) {
    console.warn("[contact] Notification dispatch error:", notifyErr);
  }

  return { success: true };
}
