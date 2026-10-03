export interface PoWInput {
  fullName: string;
  nim?: string;
  phoneWa?: string;
  division: "builder" | "creative";
  track: string;
  portfolioUrl: string;
  toolchainNarrative: string;
}

export function validatePoWSubmission(data: PoWInput): { isValid: boolean; error?: string } {
  if (!data.fullName || data.fullName.trim().length < 3) {
    return { isValid: false, error: "Nama lengkap minimal 3 karakter." };
  }
  if (!data.portfolioUrl || !data.portfolioUrl.startsWith("http")) {
    return { isValid: false, error: "Tautan portofolio/repositori harus berupa URL valid." };
  }
  if (!data.toolchainNarrative || data.toolchainNarrative.trim().length < 15) {
    return { isValid: false, error: "Penjelasan workflow/toolchain minimal 15 karakter." };
  }
  return { isValid: true };
}
