import { Resend } from "resend";
import { escapeHtml } from "@/lib/notify";
import { monthLabel, type ContributionRules, type Division, type MonthlyStats } from "./rules";

const DASHBOARD_URL = "https://muaraai.com/dashboard";

const progress = (label: string, value: number, target: number) =>
  `<li>${label}: <strong>${value}/${target}</strong></li>`;

export function renderWarningEmail(input: {
  name: string;
  month: string;
  stats: MonthlyStats;
  division: Division;
  rules: ContributionRules;
}): { subject: string; html: string } {
  const { stats, rules } = input;
  const label = monthLabel(input.month);
  const rows =
    input.division === "builder"
      ? [
          progress("PR ter-merge", stats.mergedPrs, rules.builder.mergedPrs),
          progress("PR di repo orang lain", stats.externalPrs, rules.builder.externalPrs),
          progress("Commit di PR ter-merge", stats.commits, rules.builder.commits),
          progress("Repo baru", stats.newRepos, rules.builder.newRepos),
        ]
      : [
          progress("PR ter-merge", stats.mergedPrs, rules.creative.mergedPrs),
          progress("PR di repo orang lain", stats.externalPrs, rules.creative.externalPrs),
          progress("Karya baru", stats.newWorks, rules.creative.newWorks),
        ];

  return {
    subject: `Pengingat kontribusi ${label}`,
    html:
      `<p>Halo ${escapeHtml(input.name)},</p>` +
      `<p>Target kontribusimu untuk ${escapeHtml(label)} belum terpenuhi:</p>` +
      `<ul>${rows.join("")}</ul>` +
      `<p>Ini peringatan pertama. Kalau bulan ini target juga belum terpenuhi, keanggotaanmu akan dihentikan. ` +
      `Cek progresmu di <a href="${DASHBOARD_URL}">${DASHBOARD_URL}</a>.</p>` +
      `<p>Ada kendala? Balas email ini atau tanya di sesi Discord mingguan.</p>` +
      `<p>Salam,<br/>Tim MuaraAI</p>`,
  };
}

export function renderKickEmail(input: { name: string; month: string }): { subject: string; html: string } {
  const label = monthLabel(input.month);
  return {
    subject: "Keanggotaanmu di MuaraAI dihentikan",
    html:
      `<p>Halo ${escapeHtml(input.name)},</p>` +
      `<p>Keanggotaanmu di MuaraAI dihentikan karena target kontribusi tidak terpenuhi dua bulan berturut-turut (sampai ${escapeHtml(label)}).</p>` +
      `<p>Kalau ada kendala atau kamu merasa ini keliru, hubungi maintainer dengan membalas email ini.</p>` +
      `<p>Terima kasih sudah berkontribusi.<br/>Tim MuaraAI</p>`,
  };
}

/** Sends through Resend; silently does nothing when RESEND_API_KEY is not configured. */
export async function sendContributionEmail(to: string, mail: { subject: string; html: string }): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return;
  await new Resend(apiKey).emails.send({ from: "Muara AI <admin@muaraai.com>", to, subject: mail.subject, html: mail.html });
}
