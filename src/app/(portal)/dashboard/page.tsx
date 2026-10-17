import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import Link from "next/link";
import Icon from "@/components/ui/icon";
import { getEarliestExitDate } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", user?.id)
    .single();

  const member = memberData as Member;
  const { data: intakeSetting } = await supabase
    .from("community_settings")
    .select("value")
    .eq("key", "membership_intake")
    .maybeSingle();
  const intakePolicy = intakeSetting?.value as MembershipIntakePolicy | undefined;
  const earliestExitAt = intakePolicy
    ? getEarliestExitDate(member.membership_started_at, intakePolicy.minimum_active_days_before_exit)
    : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-[0.16em] text-muara-ocean">Member workspace</p>
        <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold text-foreground mb-1">
          Beranda
        </h1>
        <p className="text-sm text-secondary font-sans">
          Pantau status membership dan lanjutkan langkah berikutnya di MuaraAI.
        </p>
      </div>

      <section className="rounded-[18px] border border-stroke bg-white p-6 shadow-diffusion">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-xs font-mono uppercase text-secondary">Status membership</div>
            <div className="mt-2 flex items-center gap-2 text-xl font-display font-bold text-foreground">
              <span className="h-2.5 w-2.5 rounded-full bg-status-success" aria-hidden="true" />
              Aktif
            </div>
            <p className="mt-2 text-sm text-secondary">Akun kamu dapat mengakses ruang belajar, project, dan akses bersama.</p>
          </div>
          <Link href="/dashboard/learn" className="inline-flex min-h-11 items-center justify-center rounded-md bg-foreground px-4 py-2.5 text-sm font-semibold text-white hover:bg-secondary transition-colors">
            Lanjut belajar
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/learn" className="rounded-xl border border-stroke bg-surface-alt p-5 transition-colors hover:border-muara-ocean">
          <div className="text-xs font-mono uppercase text-secondary">Berikutnya</div>
          <div className="mt-2 font-display font-semibold text-foreground">Buka materi belajar</div>
        </Link>
        <Link href="/dashboard/vault" className="rounded-xl border border-stroke bg-surface-alt p-5 transition-colors hover:border-muara-ocean">
          <div className="text-xs font-mono uppercase text-secondary">Akses</div>
          <div className="mt-2 font-display font-semibold text-foreground">Kelola API key</div>
        </Link>
        <Link href="/membership-exit" className="rounded-xl border border-stroke bg-surface-alt p-5 transition-colors hover:border-muara-ocean">
          <div className="text-xs font-mono uppercase text-secondary">Lifecycle</div>
          <div className="mt-2 font-display font-semibold text-foreground">Lihat status membership</div>
        </Link>
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">Profil lengkap</h2>
        <span className="text-xs text-secondary">Data yang terverifikasi</span>
      </div>

      {member.registration_status === "pending" && (
        <div className="rounded-[18px] border border-amber-200 bg-amber-50 p-5 text-xs text-amber-900 flex items-start gap-3">
          <Icon name="pending" className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-foreground mb-0.5">Status Pendaftaran: Menunggu Review</div>
            Berkas Proof of Work Anda sedang ditinjau oleh Core Team. Anda akan menerima undangan resmi ke GitHub Org setelah diverifikasi.
          </div>
        </div>
      )}

      {member.membership_started_at && member.membership_status === "active" && (
        <div className="rounded-[18px] border border-stroke bg-surface-alt p-5 shadow-diffusion flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs font-mono uppercase text-secondary">Lifecycle Membership</div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              Aktif sejak {new Date(member.membership_started_at).toLocaleDateString("id-ID")}
            </div>
            <div className="mt-1 text-xs text-secondary">
              {earliestExitAt
                ? `Boleh mengajukan keluar mulai ${earliestExitAt.toLocaleDateString("id-ID")}.`
                : "Tanggal eligibility exit belum tersedia."}
            </div>
          </div>
          <Link
            href="/membership-exit"
            className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-stroke bg-white px-4 py-2 text-xs font-semibold text-foreground hover:border-muara-ocean hover:text-muara-ocean transition-colors shadow-xs"
          >
            <Icon name="logout" className="w-4 h-4" />
            Ajukan Keluar
          </Link>
        </div>
      )}

      {/* Main Details Card */}
      <div className="rounded-[18px] border border-stroke bg-white p-6 sm:p-8 space-y-6 shadow-diffusion">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-stroke">
          <div>
            <div className="text-xs font-mono text-secondary uppercase">Nama Lengkap</div>
            <div className="font-display text-xl font-bold text-foreground mt-0.5">{member.full_name}</div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {Array.from(
              new Set(
                [member.role_title, ...(member.titles || [])].filter((t): t is string =>
                  Boolean(t && t.trim())
                )
              )
            ).map((title, idx) => (
              <span
                key={idx}
                className="rounded-md bg-surface-alt border border-stroke px-2.5 py-1 text-xs font-mono text-muara-ocean font-semibold"
              >
                {title}
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-xs">
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Kampus & Kelas</div>
            <div className="text-foreground font-mono font-bold">
              {member.campus || "UBSI Pontianak"} {member.kelas ? `(${member.kelas})` : ""}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">NIM Mahasiswa</div>
            <div className="text-foreground font-mono">{member.nim || "-"}</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">GitHub Account</div>
            <div className="text-foreground font-mono">@{member.github_username}</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Divisi & Track</div>
            <div className="text-foreground font-mono capitalize">
              {member.division} ({member.track || "General"})
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Total Commits</div>
            <div className="text-foreground font-mono">{member.total_commits || 0} commits</div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Status Keaktifan</div>
            <div className="text-foreground font-mono">
              {member.is_active ? "Aktif" : "Dinonaktifkan / Tunggakan"}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Masa Aktif Iuran Kas</div>
            <div className="text-foreground font-mono">
              {member.dues_valid_until || "Belum dibayar"}
            </div>
          </div>
          <div>
            <div className="text-secondary uppercase font-mono mb-1">Tautan Portofolio / PoW</div>
            <Link
              href={member.portfolio_url || "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muara-ocean hover:underline truncate block font-mono"
            >
              {member.portfolio_url || "Belum ada link"}
            </Link>
          </div>
        </div>

        {member.bio && (
          <div className="pt-4 border-t border-stroke">
            <div className="text-secondary uppercase font-mono text-xs mb-1.5">Toolchain & Workflow</div>
            <p className="text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap bg-surface-alt p-3.5 rounded-[10px] border border-stroke">
              {member.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
