"use server";

import { createClient } from "@/lib/supabase/server";
import { isMaintainer } from "@/lib/guards";
import { escapeHtml, notifyMaintainers } from "@/lib/notify";
import { Resend } from "resend";

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

export async function replyInboxMessage({
  messageId,
  replySubject,
  replyBody,
}: {
  messageId: string;
  replySubject: string;
  replyBody: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: member } = await supabase
    .from("members")
    .select("hierarchy, roles, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!isMaintainer(member)) {
    return { success: false, error: "Forbidden: Hanya maintainer yang dapat membalas pesan." };
  }

  // Get original message
  const { data: inboxMsg, error: fetchErr } = await supabase
    .from("inbox_messages")
    .select("*")
    .eq("id", messageId)
    .single();

  if (fetchErr || !inboxMsg) {
    return { success: false, error: "Pesan tidak ditemukan." };
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY belum disetel di server." };
  }

  const resend = new Resend(resendApiKey);
  const maintainerName = member?.full_name || "Maintainer Muara AI";

  try {
    const { error: sendErr } = await resend.emails.send({
      from: "Muara AI <admin@muaraai.com>",
      to: [inboxMsg.sender_email],
      replyTo: "admin@muaraai.com",
      subject: replySubject.trim() || `Re: ${inboxMsg.subject}`,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:600px;margin:0 auto;padding:24px;border:1px solid #E2E8F0;border-radius:12px;background:#FFFFFF;color:#0B253A;">
          <div style="padding-bottom:16px;margin-bottom:20px;border-bottom:2px solid #0284C7;">
            <span style="font-size:18px;font-weight:bold;color:#0284C7;letter-spacing:-0.5px;">Muara AI Syndicate</span>
          </div>
          <p style="font-size:14px;line-height:1.6;margin-bottom:16px;">
            Halo <strong>${escapeHtml(inboxMsg.sender_name ?? "")}</strong>${inboxMsg.organization ? ` (${escapeHtml(inboxMsg.organization)})` : ""},
          </p>
          <div style="font-size:14px;line-height:1.6;white-space:pre-wrap;background:#F8FAFC;padding:16px;border-radius:8px;border:1px solid #E2E8F0;margin-bottom:20px;">${escapeHtml(replyBody.trim())}</div>
          <p style="font-size:13px;color:#64748B;line-height:1.5;">
            Pesan ini dikirimkan langsung oleh <strong>${escapeHtml(maintainerName)}</strong> dari Maintainer Core Team Muara AI.
          </p>
          <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E2E8F0;font-size:11px;color:#94A3B8;">
            © ${new Date().getFullYear()} Muara AI • AI Engineering & Creative Syndicate • Pontianak
          </div>
        </div>
      `,
    });

    if (sendErr) {
      console.error("[contact:replyInboxMessage]", sendErr.message);
      return { success: false, error: "Gagal mengirim balasan email. Silakan coba lagi." };
    }

    // Update database status
    await supabase
      .from("inbox_messages")
      .update({
        status: "replied",
        reply_body: replyBody.trim(),
        replied_at: new Date().toISOString(),
        replied_by: user.id,
      })
      .eq("id", messageId);

    // Also record in sent_emails for audit
    await supabase.from("sent_emails").insert({
      recipient_type: "external_partner",
      recipient_email: inboxMsg.sender_email,
      subject: replySubject.trim() || `Re: ${inboxMsg.subject}`,
      body: replyBody.trim(),
      sent_by: user.id,
    });

    return { success: true };
  } catch (e) {
    console.error("[contact:replyInboxMessage]", e);
    return { success: false, error: "Gagal mengirim balasan email. Silakan coba lagi." };
  }
}

export async function markInboxMessageRead(messageId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const { data: member } = await supabase
    .from("members")
    .select("hierarchy, roles")
    .eq("id", user.id)
    .maybeSingle();

  if (!isMaintainer(member)) {
    return { success: false, error: "Forbidden" };
  }

  const { error } = await supabase
    .from("inbox_messages")
    .update({ status: "read" })
    .eq("id", messageId);

  if (error) {
    console.error("[contact:markInboxMessageRead]", error.message);
    return { success: false, error: "Terjadi kesalahan pada server. Silakan coba lagi." };
  }

  return { success: true };
}
