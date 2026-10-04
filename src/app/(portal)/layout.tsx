import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import Icon from "@/components/ui/icon";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  const member = memberData as Member | null;

  // Unregistered, pending, or non-active members redirected to onboarding
  if (!member || member.registration_status !== "approved" || !member.is_active) {
    redirect("/onboarding");
  }

  const isMaintainer =
    member.hierarchy === "maintainer" || member.roles?.includes("maintainer");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border bg-white p-6 flex flex-col justify-between shrink-0 shadow-sm">
        <div>
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 mb-8">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-slate-50 border border-muara-ocean/30 text-muara-ocean font-display font-bold text-sm">
              M
            </span>
            <span className="font-display font-bold text-foreground text-base">Muara AI</span>
          </Link>

          {/* Member Badge Mini Card */}
          <div className="rounded-lg border border-border bg-slate-50 p-3 mb-6">
            <div className="font-medium text-xs text-foreground truncate">{member.full_name}</div>
            <div className="text-[11px] font-mono text-slate-500">@{member.github_username}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span
                className={`h-2 w-2 rounded-full ${
                  member.registration_status === "approved"
                    ? member.is_active
                      ? "bg-emerald-500"
                      : "bg-red-500"
                    : "bg-amber-500 animate-pulse"
                }`}
              />
              <span className="text-[10px] font-mono uppercase text-slate-600 font-semibold">
                {member.registration_status === "approved"
                  ? member.is_active
                    ? "Active Member"
                    : "Suspended"
                  : "Pending Review"}
              </span>
            </div>
          </div>

          {/* Nav links */}
          <nav className="space-y-1 text-xs font-medium text-slate-700">
            <div className="text-[10px] font-mono uppercase text-slate-400 px-3 py-1 font-semibold">Member Area</div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <Icon name="badge" className="w-4 h-4 text-muara-ocean" />
              Profil & PoW
            </Link>
            <Link
              href="/dashboard/vault"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <Icon name="lock" className="w-4 h-4 text-muara-ocean" />
              Vault & API Keys
            </Link>
            <Link
              href="/dashboard/treasury"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <Icon name="account_balance_wallet" className="w-4 h-4 text-muara-ocean" />
              Kas Komunitas (QRIS)
            </Link>
            <Link
              href="/dashboard/learn"
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
            >
              <Icon name="upload_file" className="w-4 h-4 text-muara-ocean" />
              Muara Learn
            </Link>

            {/* Maintainer Admin Section */}
            {isMaintainer && (
              <>
                <div className="text-[10px] font-mono uppercase text-amber-600 px-3 pt-6 pb-1 font-bold">
                  Maintainer Control
                </div>
                <Link
                  href="/admin/review"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="how_to_reg" className="w-4 h-4 text-amber-600" />
                  Review Antrean
                </Link>
                <Link
                  href="/admin/treasury"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="receipt_long" className="w-4 h-4 text-amber-600" />
                  Pencatatan Kas
                </Link>
                <Link
                  href="/admin/learn"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="upload_file" className="w-4 h-4 text-amber-600" />
                  Kelola Materi
                </Link>
                <Link
                  href="/admin/mail"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="mail" className="w-4 h-4 text-amber-600" />
                  Resend Console
                </Link>
                <Link
                  href="/admin/achievements"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="workspace_premium" className="w-4 h-4 text-amber-600" />
                  Kelola Sertifikat
                </Link>
                <Link
                  href="/admin/members"
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-foreground transition-colors"
                >
                  <Icon name="rule" className="w-4 h-4 text-amber-600" />
                  Audit Anggota
                </Link>
              </>
            )}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div className="pt-6 border-t border-border mt-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-foreground transition-colors"
          >
            <Icon name="arrow_back" className="w-4 h-4" />
            Kembali ke Beranda
          </Link>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl">{children}</main>
    </div>
  );
}
