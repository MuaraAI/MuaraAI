export interface PoWInput {
  fullName: string;
  nim: string;
  campus: string;
  prodi: string;
  kelas: string;
  phoneWa: string;
  division: "builder" | "creative";
  track: string;
  portfolioUrl: string;
  websiteUrl?: string;
  linkedinUrl?: string;
  instagramUrl?: string;
  xUrl?: string;
  threadsUrl?: string;
  toolchainNarrative: string;
}

export function validatePoWSubmission(data: PoWInput): { isValid: boolean; error?: string } {
  if (!data.fullName || data.fullName.trim().length < 3) {
    return { isValid: false, error: "Nama lengkap minimal 3 karakter." };
  }
  const cleanNim = data.nim?.trim() || "";
  if (!/^\d{8}$/.test(cleanNim)) {
    return { isValid: false, error: "NIM wajib berupa 8 digit angka resmi UBSI (misal: 15260767)." };
  }
  if (!data.campus || data.campus.trim().length < 3) {
    return { isValid: false, error: "Pilih kampus asal UBSI Anda." };
  }
  if (!data.prodi || data.prodi.trim().length < 3) {
    return { isValid: false, error: "Pilih Program Studi Anda." };
  }
  if (!data.kelas || data.kelas.trim().length < 4) {
    return { isValid: false, error: "Kode kelas UBSI wajib diisi (misal: 15.1C.30)." };
  }
  if (!data.phoneWa || data.phoneWa.trim().length < 9) {
    return { isValid: false, error: "Nomor WhatsApp aktif wajib diisi." };
  }
  if (!data.portfolioUrl || !data.portfolioUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan portofolio/repositori karya wajib berupa URL valid (awali https://)." };
  }
  if (data.websiteUrl && data.websiteUrl.trim() && !data.websiteUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan Website pribadi harus diawali dengan http:// atau https://" };
  }
  if (data.linkedinUrl && data.linkedinUrl.trim() && !data.linkedinUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan LinkedIn harus diawali dengan https://" };
  }
  if (!data.toolchainNarrative || data.toolchainNarrative.trim().length < 15) {
    return { isValid: false, error: "Penjelasan workflow/toolchain minimal 15 karakter." };
  }
  return { isValid: true };
}
