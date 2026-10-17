"use server";

import { createClient } from "@/lib/supabase/server";
import { isMaintainer } from "@/lib/guards";
import { Resend } from "resend";

async function assertMaintainer() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Unauthorized");

  const { data: member } = await supabase
    .from("members")
    .select("id, hierarchy, roles")
    .eq("id", user.id)
    .single();

  if (!isMaintainer(member)) {
    throw new Error("Forbidden: Maintainer access required");
  }

  return { supabase, user };
}

// 1. Approve applicant & invite to GitHub Org
export async function approveApplicant(memberId: string) {
  const { supabase, user } = await assertMaintainer();

  const { data: member, error: fetchErr } = await supabase
    .from("members")
    .select("id, github_username, email, full_name, registration_status, membership_status, reapply_blocked, membership_started_at")
    .eq("id", memberId)
    .single();

  if (fetchErr || !member) {
    return { success: false, error: "Member not found" };
  }

  if (member.reapply_blocked || member.membership_status === "exited") {
    return { success: false, error: "Member ini sudah pernah keluar dan tidak dapat di-approve ulang." };
  }

  if (member.registration_status !== "pending") {
    return { success: false, error: "Pendaftar ini tidak lagi berada dalam status pending." };
  }

  // Update DB status to approved without resetting the original start date
  const { error: updateErr } = await supabase
    .from("members")
    .update({
      registration_status: "approved",
      membership_status: "active",
      is_active: true,
      membership_started_at: member.membership_started_at ?? new Date().toISOString(),
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (updateErr) {
    return { success: false, error: updateErr.message };
  }

  // Auto invite to GitHub Organization via API
  const ghToken = process.env.GITHUB_ORG_TOKEN;
  if (ghToken && member.github_username) {
    try {
      await fetch(
        `https://api.github.com/orgs/MuaraAI/memberships/${member.github_username}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${ghToken}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "MuaraAI-Web-Portal",
          },
          body: JSON.stringify({ role: "member" }),
        }
      );
    } catch (e) {
      console.error("GitHub Org invite failed:", e);
    }
  }

  // Send congratulations email via Resend if email exists
  const resendApiKey = process.env.RESEND_API_KEY;
  if (resendApiKey && member.email) {
    try {
      const resend = new Resend(resendApiKey);
      await resend.emails.send({
        from: "Muara AI <admin@muaraai.com>",
        to: member.email,
        subject: "Selamat! Proof of Work Anda Diterima di Muara AI",
        html: `<p>Halo ${member.full_name},</p><p>Karya Anda telah disetujui oleh Core Team. Undangan bergabung ke GitHub Org MuaraAI telah dikirimkan ke akun @${member.github_username}. Silakan cek email/notifikasi GitHub Anda dan kunjungi <a href="https://muaraai.com/dashboard">Dashboard Muara AI</a>.</p>`,
      });
    } catch (e) {
      console.error("Resend email failed:", e);
    }
  }

  return { success: true };
}

// 2. Reject applicant
export async function rejectApplicant(memberId: string) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase
    .from("members")
    .update({
      registration_status: "rejected",
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", memberId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 3. Log Expense
export async function logExpense(data: {
  amount: number;
  category: string;
  description: string;
}) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase.from("treasury_transactions").insert({
    type: "expense",
    amount: data.amount,
    category: data.category,
    description: data.description,
    status: "paid",
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 4. Publish Material
export async function publishMaterial(data: {
  title: string;
  description: string;
  resourceUrl: string;
  coverUrl?: string;
  division: string;
}) {
  const { supabase, user } = await assertMaintainer();

  const { error } = await supabase.from("learning_materials").insert({
    title: data.title,
    description: data.description,
    resource_url: data.resourceUrl,
    cover_url: data.coverUrl || null,
    division: data.division,
    created_by: user.id,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 5. Send Resend Broadcast Mail
export async function sendBroadcastEmail(data: {
  recipientType: string;
  recipientEmail?: string;
  subject: string;
  body: string;
}) {
  const { supabase, user } = await assertMaintainer();

  let targetEmails: string[] = [];

  if (data.recipientType === "all") {
    const { data: members } = await supabase
      .from("members")
      .select("email")
      .eq("registration_status", "approved")
      .not("email", "is", null);
    targetEmails = (members || []).map((m) => m.email!).filter(Boolean);
  } else if (data.recipientType === "builder" || data.recipientType === "creative") {
    const { data: members } = await supabase
      .from("members")
      .select("email")
      .eq("division", data.recipientType)
      .eq("registration_status", "approved")
      .not("email", "is", null);
    targetEmails = (members || []).map((m) => m.email!).filter(Boolean);
  } else if (data.recipientEmail) {
    targetEmails = [data.recipientEmail.trim()];
  }

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  const resend = new Resend(resendApiKey);

  for (const email of targetEmails) {
    try {
      await resend.emails.send({
        from: "Muara AI <admin@muaraai.com>",
        to: email,
        subject: data.subject,
        html: `<div style="font-family:sans-serif;padding:16px;">
          <h2>${data.subject}</h2>
          <p style="white-space:pre-wrap;">${data.body}</p>
        </div>`,
      });

      // Log to sent_emails
      await supabase.from("sent_emails").insert({
        recipient_type: data.recipientType,
        recipient_email: email,
        subject: data.subject,
        body: data.body,
        sent_by: user.id,
      });
    } catch (e) {
      console.error(`Failed to send email to ${email}:`, e);
    }
  }

  return { success: true, count: targetEmails.length };
}

// 6. Create Achievement
export async function addAchievement(data: {
  title: string;
  issuer: string;
  issueDate: string;
  imageUrl: string;
  credentialUrl?: string;
  recipientNames: string[];
}) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase.from("achievements").insert({
    title: data.title,
    issuer: data.issuer,
    issue_date: data.issueDate,
    image_url: data.imageUrl,
    credential_url: data.credentialUrl || null,
    recipient_names: data.recipientNames,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

// 7. Toggle Member Status (Blacklist)
export async function toggleMemberActive(memberId: string, isActive: boolean) {
  const { supabase } = await assertMaintainer();

  const { error } = await supabase
    .from("members")
    .update({ is_active: isActive })
    .eq("id", memberId);

  if (error) return { success: false, error: error.message };
  return { success: true };
}
