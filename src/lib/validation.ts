import type { Affiliation } from "@/types/database";
import type { PositionsConfig } from "@/lib/positions";

export const AFFILIATIONS: readonly Affiliation[] = ["mahasiswa", "pelajar", "umum", "lainnya"];
export const AFFILIATION_LABELS: Record<Affiliation, string> = {
  mahasiswa: "Mahasiswa",
  pelajar: "Pelajar",
  umum: "Umum",
  lainnya: "Lainnya",
};
export type Division = "builder" | "creative";
export const MIN_JOIN_REASON_LENGTH = 50;

const TELEGRAM_PATTERN = /^[A-Za-z0-9_]{5,32}$/;
const MAX_LENGTHS = { fullName: 100, institution: 150, longText: 2000, url: 500, phone: 30 } as const;
const isOptionalText = (value: unknown) => value === undefined || value === null || typeof value === "string";

export interface PoWInput {
  fullName: string;
  affiliation: Affiliation;
  institution?: string;
  phoneWa: string;
  telegramUsername?: string;
  division: Division;
  track: string;
  secondaryDivision?: Division;
  secondaryTrack?: string;
  joinReason: string;
  portfolioUrl: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  threadsUrl?: string;
  toolchainNarrative: string;
}

export function normalizeTelegram(value?: string): string | null {
  const handle = value?.trim().replace(/^@/, "") ?? "";
  return handle ? handle : null;
}

const isDivision = (value: unknown): value is Division => value === "builder" || value === "creative";

export function validatePoWSubmission(
  data: PoWInput,
  positions: PositionsConfig
): { isValid: boolean; error?: string } {
  const requiredText = [data.fullName, data.joinReason, data.toolchainNarrative, data.phoneWa, data.portfolioUrl, data.track];
  const optionalText = [
    data.institution,
    data.telegramUsername,
    data.secondaryTrack,
    data.websiteUrl,
    data.linkedinUrl,
    data.instagramUrl,
    data.xUrl,
    data.threadsUrl,
  ];
  if (!requiredText.every((value) => typeof value === "string") || !optionalText.every(isOptionalText)) {
    return { isValid: false, error: "Data pendaftaran tidak valid." };
  }

  const fullName = data.fullName.trim();
  if (fullName.length < 3) {
    return { isValid: false, error: "Nama lengkap minimal 3 karakter." };
  }
  if (fullName.length > MAX_LENGTHS.fullName) {
    return { isValid: false, error: `Nama lengkap maksimal ${MAX_LENGTHS.fullName} karakter.` };
  }
  if (!AFFILIATIONS.includes(data.affiliation)) {
    return { isValid: false, error: "Pilih status kamu: mahasiswa, pelajar, umum, atau lainnya." };
  }
  if ((data.institution ?? "").trim().length > MAX_LENGTHS.institution) {
    return { isValid: false, error: `Institusi maksimal ${MAX_LENGTHS.institution} karakter.` };
  }
  const joinReason = data.joinReason.trim();
  if (joinReason.length < MIN_JOIN_REASON_LENGTH) {
    return { isValid: false, error: `Alasan bergabung minimal ${MIN_JOIN_REASON_LENGTH} karakter.` };
  }
  if (joinReason.length > MAX_LENGTHS.longText) {
    return { isValid: false, error: `Alasan bergabung maksimal ${MAX_LENGTHS.longText} karakter.` };
  }
  if (!isDivision(data.division)) {
    return { isValid: false, error: "Divisi tidak valid." };
  }
  if (!positions[data.division].includes(data.track)) {
    return { isValid: false, error: "Posisi tidak valid untuk divisi yang dipilih." };
  }
  if (data.secondaryTrack && !data.secondaryDivision) {
    return { isValid: false, error: "Pilih divisi kedua untuk posisi kedua." };
  }
  if (data.secondaryDivision) {
    if (!isDivision(data.secondaryDivision)) {
      return { isValid: false, error: "Divisi kedua tidak valid." };
    }
    if (data.secondaryDivision === data.division) {
      return { isValid: false, error: "Divisi kedua harus berbeda dari divisi utama." };
    }
    if (!data.secondaryTrack || !positions[data.secondaryDivision].includes(data.secondaryTrack)) {
      return { isValid: false, error: "Posisi tidak valid untuk divisi kedua." };
    }
  }
  if (!data.portfolioUrl || !data.portfolioUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan portofolio/repositori karya wajib berupa URL valid (awali https://)." };
  }
  if (data.websiteUrl && data.websiteUrl.trim() && !data.websiteUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan website pribadi harus diawali dengan http:// atau https://" };
  }
  if (data.linkedinUrl && data.linkedinUrl.trim() && !data.linkedinUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan LinkedIn harus diawali dengan https://" };
  }
  if (data.toolchainNarrative.trim().length < 15) {
    return { isValid: false, error: "Penjelasan workflow/toolchain minimal 15 karakter." };
  }
  if (data.toolchainNarrative.trim().length > MAX_LENGTHS.longText) {
    return { isValid: false, error: `Penjelasan workflow/toolchain maksimal ${MAX_LENGTHS.longText} karakter.` };
  }
  const urls = [data.portfolioUrl, data.websiteUrl, data.linkedinUrl, data.instagramUrl, data.xUrl, data.threadsUrl];
  if (urls.some((url) => (url ?? "").length > MAX_LENGTHS.url)) {
    return { isValid: false, error: `Tautan terlalu panjang (maksimal ${MAX_LENGTHS.url} karakter).` };
  }
  if (data.phoneWa.trim().length < 9) {
    return { isValid: false, error: "Nomor WhatsApp aktif wajib diisi." };
  }
  if (data.phoneWa.trim().length > MAX_LENGTHS.phone) {
    return { isValid: false, error: "Nomor WhatsApp terlalu panjang." };
  }
  const telegram = normalizeTelegram(data.telegramUsername);
  if (telegram && !TELEGRAM_PATTERN.test(telegram)) {
    return { isValid: false, error: "Username Telegram tidak valid." };
  }
  return { isValid: true };
}
