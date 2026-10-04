import React from "react";
import { createClient } from "@/lib/supabase/server";
import { Member } from "@/types/database";
import Link from "next/link";
import Icon from "@/components/ui/icon";

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-1">
          Profil Anggota & Status Keanggotaan
        </h1>
        <p className="text-xs text-secondary font-sans">
          Informasi portofolio terverifikasi, spesialisasi divisi, dan identitas mahasiswa dalam ekosistem Muara AI.
        </p>
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
