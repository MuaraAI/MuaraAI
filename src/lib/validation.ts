import { isDivision, positionsOf, type Division } from "@/lib/structure";
import type { Affiliation } from "@/types/database";
import type { PositionsConfig } from "@/lib/positions";
import { normalizeLocale, type Locale } from "@/lib/locale";

export const AFFILIATIONS: readonly Affiliation[] = ["mahasiswa", "pelajar", "umum", "lainnya"];
export const AFFILIATION_LABELS: Record<Affiliation, string> = {
  mahasiswa: "Mahasiswa",
  pelajar: "Pelajar",
  umum: "Umum",
  lainnya: "Lainnya",
};
export type { Division } from "@/lib/structure";
export const MIN_JOIN_REASON_LENGTH = 50;

export type { Locale };

interface Messages {
  invalidData: string;
  nameShort: string;
  nameLong(max: number): string;
  affiliation: string;
  institutionLong(max: number): string;
  reasonShort(min: number): string;
  reasonLong(max: number): string;
  division: string;
  track: string;
  secondaryNeedsDivision: string;
  secondaryDivision: string;
  secondarySame: string;
  secondaryTrack: string;
  portfolio: string;
  website: string;
  linkedin: string;
  toolchainShort: string;
  toolchainLong(max: number): string;
  urlLong(max: number): string;
  phoneShort: string;
  phoneLong: string;
  telegram: string;
}

/** Error messages shown to the applicant. Every key must exist in both languages (checked by the type and a test). */
export const VALIDATION_MESSAGES: Record<Locale, Messages> = {
  id: {
    invalidData: "Data pendaftaran tidak valid.",
    nameShort: "Nama lengkap minimal 3 karakter.",
    nameLong: (max) => `Nama lengkap maksimal ${max} karakter.`,
    affiliation: "Pilih status kamu: mahasiswa, pelajar, umum, atau lainnya.",
    institutionLong: (max) => `Institusi maksimal ${max} karakter.`,
    reasonShort: (min) => `Alasan bergabung minimal ${min} karakter.`,
    reasonLong: (max) => `Alasan bergabung maksimal ${max} karakter.`,
    division: "Divisi tidak valid.",
    track: "Posisi tidak valid untuk divisi yang dipilih.",
    secondaryNeedsDivision: "Pilih divisi kedua untuk posisi kedua.",
    secondaryDivision: "Divisi kedua tidak valid.",
    secondarySame: "Divisi kedua harus berbeda dari divisi utama.",
    secondaryTrack: "Posisi tidak valid untuk divisi kedua.",
    portfolio: "Tautan portofolio/repositori karya wajib berupa URL valid (awali https://).",
    website: "Tautan website pribadi harus diawali dengan http:// atau https://",
    linkedin: "Tautan LinkedIn harus diawali dengan https://",
    toolchainShort: "Penjelasan workflow/toolchain minimal 15 karakter.",
    toolchainLong: (max) => `Penjelasan workflow/toolchain maksimal ${max} karakter.`,
    urlLong: (max) => `Tautan terlalu panjang (maksimal ${max} karakter).`,
    phoneShort: "Nomor WhatsApp aktif wajib diisi.",
    phoneLong: "Nomor WhatsApp terlalu panjang.",
    telegram: "Username Telegram tidak valid.",
  },
  en: {
    invalidData: "The registration data is not valid.",
    nameShort: "Full name must be at least 3 characters.",
    nameLong: (max) => `Full name can be at most ${max} characters.`,
    affiliation: "Choose your status: student, learner, general or other.",
    institutionLong: (max) => `Institution can be at most ${max} characters.`,
    reasonShort: (min) => `Your reason for joining must be at least ${min} characters.`,
    reasonLong: (max) => `Your reason for joining can be at most ${max} characters.`,
    division: "Invalid division.",
    track: "Invalid position for the chosen division.",
    secondaryNeedsDivision: "Choose a second division for the second position.",
    secondaryDivision: "Invalid second division.",
    secondarySame: "The second division must differ from the main division.",
    secondaryTrack: "Invalid position for the second division.",
    portfolio: "The portfolio or repository link must be a valid URL (start with https://).",
    website: "Your personal website link must start with http:// or https://",
    linkedin: "The LinkedIn link must start with https://",
    toolchainShort: "The tools and workflow description must be at least 15 characters.",
    toolchainLong: (max) => `The tools and workflow description can be at most ${max} characters.`,
    urlLong: (max) => `A link is too long (at most ${max} characters).`,
    phoneShort: "An active WhatsApp number is required.",
    phoneLong: "The WhatsApp number is too long.",
    telegram: "The Telegram username is not valid.",
  },
};

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


export function validatePoWSubmission(
  data: PoWInput,
  positions: PositionsConfig,
  locale: Locale = "id"
): { isValid: boolean; error?: string } {
  const m = VALIDATION_MESSAGES[normalizeLocale(locale)];
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
    return { isValid: false, error: m.invalidData };
  }

  const fullName = data.fullName.trim();
  if (fullName.length < 3) {
    return { isValid: false, error: m.nameShort };
  }
  if (fullName.length > MAX_LENGTHS.fullName) {
    return { isValid: false, error: m.nameLong(MAX_LENGTHS.fullName) };
  }
  if (!AFFILIATIONS.includes(data.affiliation)) {
    return { isValid: false, error: m.affiliation };
  }
  if ((data.institution ?? "").trim().length > MAX_LENGTHS.institution) {
    return { isValid: false, error: m.institutionLong(MAX_LENGTHS.institution) };
  }
  const joinReason = data.joinReason.trim();
  if (joinReason.length < MIN_JOIN_REASON_LENGTH) {
    return { isValid: false, error: m.reasonShort(MIN_JOIN_REASON_LENGTH) };
  }
  if (joinReason.length > MAX_LENGTHS.longText) {
    return { isValid: false, error: m.reasonLong(MAX_LENGTHS.longText) };
  }
  if (!isDivision(data.division)) {
    return { isValid: false, error: m.division };
  }
  if (!positionsOf(positions, data.division).includes(data.track)) {
    return { isValid: false, error: m.track };
  }
  if (data.secondaryTrack && !data.secondaryDivision) {
    return { isValid: false, error: m.secondaryNeedsDivision };
  }
  if (data.secondaryDivision) {
    if (!isDivision(data.secondaryDivision)) {
      return { isValid: false, error: m.secondaryDivision };
    }
    if (data.secondaryDivision === data.division) {
      return { isValid: false, error: m.secondarySame };
    }
    if (!data.secondaryTrack || !positionsOf(positions, data.secondaryDivision).includes(data.secondaryTrack)) {
      return { isValid: false, error: m.secondaryTrack };
    }
  }
  if (!data.portfolioUrl || !data.portfolioUrl.startsWith("http")) {
    return { isValid: false, error: m.portfolio };
  }
  if (data.websiteUrl && data.websiteUrl.trim() && !data.websiteUrl.startsWith("http")) {
    return { isValid: false, error: m.website };
  }
  if (data.linkedinUrl && data.linkedinUrl.trim() && !data.linkedinUrl.startsWith("http")) {
    return { isValid: false, error: m.linkedin };
  }
  if (data.toolchainNarrative.trim().length < 15) {
    return { isValid: false, error: m.toolchainShort };
  }
  if (data.toolchainNarrative.trim().length > MAX_LENGTHS.longText) {
    return { isValid: false, error: m.toolchainLong(MAX_LENGTHS.longText) };
  }
  const urls = [data.portfolioUrl, data.websiteUrl, data.linkedinUrl, data.instagramUrl, data.xUrl, data.threadsUrl];
  if (urls.some((url) => (url ?? "").length > MAX_LENGTHS.url)) {
    return { isValid: false, error: m.urlLong(MAX_LENGTHS.url) };
  }
  if (data.phoneWa.trim().length < 9) {
    return { isValid: false, error: m.phoneShort };
  }
  if (data.phoneWa.trim().length > MAX_LENGTHS.phone) {
    return { isValid: false, error: m.phoneLong };
  }
  const telegram = normalizeTelegram(data.telegramUsername);
  if (telegram && !TELEGRAM_PATTERN.test(telegram)) {
    return { isValid: false, error: m.telegram };
  }
  return { isValid: true };
}
