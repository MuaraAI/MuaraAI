export const COOKIE_NAME = "sb-muaraai-auth-token";
export const COOKIE_DOMAIN = ".muaraai.com";

export const DUES_WEEKLY_FEE = 3000;
export const DUES_MONTHLY_FEE = 12000;
export const ARREARS_BLACKLIST_DAYS = 30;

export const SITE_NAME = "Muara AI";
export const SITE_URL = "https://muaraai.com";
export const GITHUB_ORG_URL = "https://github.com/MuaraAI";

export const INDONESIAN_CAMPUSES = [
  "UBSI Pontianak",
  "UBSI Jakarta Pusat (Kramat 98 / Salemba)",
  "UBSI Jakarta Selatan (Fatmawati)",
  "UBSI Jakarta Timur (Jatiwaringin / Pemuda)",
  "UBSI Jakarta Barat (Cengkareng / Slipi)",
  "UBSI Depok (Margonda)",
  "UBSI Tangerang (Cimone / BSD)",
  "UBSI Bekasi (Cut Mutia / Kaliabang)",
  "UBSI Bogor (Merdeka / Cilebut)",
  "UBSI Sukabumi",
  "UBSI Tasikmalaya",
  "UBSI Purwokerto",
  "UBSI Tegal",
  "UBSI Surakarta (Solo)",
  "UBSI Yogyakarta",
  "Kampus lain di Indonesia",
] as const;

export const UBSI_CAMPUSES = INDONESIAN_CAMPUSES; // compatibility for existing imports

export const UBSI_PRODI_LIST = [
  "Informatika (S1)",
  "Sistem Informasi (S1)",
  "Teknologi Informasi (S1)",
  "Rekayasa Perangkat Lunak (S1)",
  "Sistem Informasi (D3)",
  "Sistem Informasi Akuntansi (D3)",
  "Manajemen (S1)",
  "Ilmu Komunikasi (S1)",
  "Lainnya (Mahasiswa UBSI)",
] as const;
