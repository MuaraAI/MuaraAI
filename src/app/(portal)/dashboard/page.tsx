import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import Link from "next/link";
import { redirect } from "next/navigation";
import Icon from "@/components/ui/icon";
import { getEarliestExitDate } from "@/lib/membership";
import type { MembershipIntakePolicy } from "@/types/database";
import { PortalHeader } from "@/components/ui/section";

export default async function DashboardProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: memberData } = await supabase
    .from("members")
    .select("*")
    .eq("id", user?.id)
    .maybeSingle();

  if (!memberData) {
    redirect("/onboarding");
  }

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

  const rawRejectionTime = member.reviewed_at || member.updated_at || member.created_at;
  const rejectionTimestamp = rawRejectionTime ? new Date(rawRejectionTime).getTime() : 0;
  const cooldownMs = 24 * 60 * 60 * 1000;
  const nextEligibleTime = rejectionTimestamp + cooldownMs;
  const canReapply = Date.now() >= nextEligibleTime;
  const remainingHours = Math.max(1, Math.ceil((nextEligibleTime - Date.now()) / (60 * 60 * 1000)));

  return (
    <div className="space-y-8">
      <PortalHeader eyebrow="Member workspace" title="Beranda">
        Pantau status membership dan lanjutkan langkah berikutnya di MuaraAI.
      </PortalHeader>

      {member.registration_status === "rejected" ? (
        <section className="px-frame [--px-line:#FDA4AF] bg-rose-50/60 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div>
                <div className="text-xs font-mono uppercase text-rose-800">Status pendaftaran</div>
                <div className="mt-1 flex items-center gap-2 text-xl font-display font-bold text-rose-700">
                  <span className="h-2.5 w-2.5 bg-rose-500" aria-hidden="true" />
                  Pendaftaran Belum Diterima
                </div>
              </div>

              <div className="px-frame [--px-line:#FDA4AF] bg-white/80 p-3.5 text-xs text-secondary">
                <div className="font-semibold text-rose-900 mb-1">Catatan dari Core Team:</div>
                <p className="leading-relaxed text-foreground">
                  {member.rejection_reason || "Berkas Proof of Work belum memenuhi kriteria komunitas. Silakan perbaiki dan ajukan kembali."}
                </p>
              </div>

              <p className="text-xs text-secondary">
                {canReapply
                  ? "Masa cooldown 24 jam telah selesai. Anda dapat memperbarui data dan mengirim ulang pendaftaran sekarang."
                  : `Masa cooldown sedang berjalan. Anda dapat mengajukan pendaftaran ulang setelah 1 hari (sisa waktu ~${remainingHours} jam).`}
              </p>
            </div>

            <div className="shrink-0">
              {canReapply ? (
                <Link
                  href="/onboarding"
                  className="px-btn inline-flex min-h-11 items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
                >
                  <Icon name="refresh" className="w-4 h-4" />
                  <span>Ajukan Ulang Pendaftaran</span>
                </Link>
              ) : (
                <span className="px-btn-ghost [--px-off:3px] inline-flex min-h-11 items-center justify-center gap-2 bg-white/80 px-4 py-2.5 text-xs font-mono font-medium text-rose-700">
                  <Icon name="schedule" className="w-4 h-4 text-rose-500" />
                  <span>Cooldown aktif (~{remainingHours}j lagi)</span>
                </span>
              )}
            </div>
          </div>
        </section>
      ) : member.registration_status === "pending" ? (
        <section className="px-frame [--px-line:#FCD34D] bg-amber-50/60 p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-amber-800">Status pendaftaran</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-display font-bold text-amber-700">
                <span className="h-2.5 w-2.5 bg-amber-500 animate-pulse" aria-hidden="true" />
                Menunggu Review
              </div>
              <p className="mt-2 text-sm text-secondary">
                Berkas Proof of Work Anda sedang ditinjau oleh Core Team MuaraAI. Anda dapat melihat navigasi dan detail akun sambil menunggu verifikasi.
              </p>
            </div>
            <span className="px-btn-ghost [--px-off:3px] inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold text-amber-800">
              Dalam antrean review
            </span>
          </div>
        </section>
      ) : (
        <section className="px-card bg-white p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="text-xs font-mono uppercase text-secondary">Status membership</div>
              <div className="mt-2 flex items-center gap-2 text-xl font-display font-bold text-foreground">
                <span className="h-2.5 w-2.5 bg-status-success" aria-hidden="true" />
                Aktif
              </div>
              <p className="mt-2 text-sm text-secondary">Akun kamu dapat mengakses ruang belajar, project, dan akses bersama.</p>
            </div>
            <Link href="/dashboard/learn" className="px-btn inline-flex min-h-11 items-center justify-center px-4 py-2.5 text-sm font-semibold transition-colors">
              Lanjut belajar
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-4 sm:grid-cols-3">
        <Link href="/dashboard/learn" className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 transition-colors">
          <div className="text-xs font-mono uppercase text-secondary">Berikutnya</div>
          <div className="mt-2 font-display font-semibold text-foreground">Buka materi belajar</div>
        </Link>
        <Link href="/membership-exit" className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 transition-colors">
          <div className="text-xs font-mono uppercase text-secondary">Lifecycle</div>
          <div className="mt-2 font-display font-semibold text-foreground">Lihat status membership</div>
        </Link>
      </section>

      <div className="flex items-center justify-between gap-4">
        <h2 className="font-display text-xl font-bold text-foreground">Profil lengkap</h2>
        <span className="text-xs text-secondary">Data yang terverifikasi</span>
      </div>

      {member.registration_status === "pending" && (
        <div className="px-frame [--px-line:#FCD34D] bg-amber-50 p-5 text-xs text-amber-900 flex items-start gap-3">
          <Icon name="pending" className="w-5 h-5 text-amber-600 shrink-0" />
          <div>
            <div className="font-bold text-sm text-foreground mb-0.5">Status Pendaftaran: Menunggu Review</div>
            Berkas Proof of Work Anda sedang ditinjau oleh Core Team. Anda akan menerima undangan resmi ke GitHub Org setelah diverifikasi.
          </div>
        </div>
      )}

      {member.membership_started_at && member.membership_status === "active" && (
        <div className="px-frame [--px-line:#CFE2EE] bg-surface-alt p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
            className="px-btn-ghost [--px-off:3px] inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-foreground hover:text-muara-ocean transition-colors"
          >
            <Icon name="logout" className="w-4 h-4" />
            Ajukan Keluar
          </Link>
        </div>
      )}

      {/* Main Details Card */}
      <div className="px-card bg-white p-6 sm:p-8 space-y-6">
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
                className="bg-surface-alt border border-stroke px-2.5 py-1 text-xs font-mono text-muara-ocean font-semibold"
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
            <p className="px-frame [--px-line:#CFE2EE] text-xs text-foreground leading-relaxed font-mono whitespace-pre-wrap bg-surface-alt p-3.5">
              {member.bio}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
