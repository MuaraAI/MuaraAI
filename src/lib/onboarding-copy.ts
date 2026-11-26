import type { Affiliation } from "@/types/database";
import type { Locale } from "@/lib/locale";

export interface OnboardingCopy {
  steps: readonly [string, string, string, string];
  eyebrow: string;
  title: string;
  intro: string;
  rejectionTitle: string;
  rejectionNote: string;
  connected: string;
  connectedBody: string;
  progress: string;
  aboutLegend: string;
  aboutIntro: string;
  fullName: string;
  status: string;
  institution: string;
  institutionPlaceholder: string;
  whatsapp: string;
  whatsappPlaceholder: string;
  telegram: string;
  proofLegend: string;
  portfolio: string;
  division: string;
  track: string;
  secondaryDivision: string;
  secondaryTrack: string;
  none: string;
  toolchain: string;
  reason: string;
  profileLegend: string;
  profileIntro: string;
  website: string;
  linkedin: string;
  instagram: string;
  x: string;
  reviewLegend: string;
  summaryName: string;
  summaryStatus: string;
  summaryProof: string;
  summaryPosition: string;
  summaryReason: string;
  notFilled: string;
  disclaimer: string;
  agreeBefore: string;
  agreeAnd: string;
  agreeAfter: string;
  back: string;
  next: string;
  submit: string;
  submitting: string;
  toGithub: string;
  agreeRequired: string;
  submitFailed: string;
  affiliations: Record<Affiliation, string>;
  /** Where GitHub sends a new account back to, so the form keeps its language. */
  loginHref: string;
  preparingTitle: string;
  preparingBody: string;
  /** Placeholder of an empty select. */
  choose: string;
}

/** All text of the registration form. The Indonesian strings are the original ones; every key exists in both languages. */
export const ONBOARDING_COPY: Record<Locale, OnboardingCopy> = {
  id: {
    steps: ["Tentang kamu", "Proof of Work", "Profil publik", "Review"],
    eyebrow: "Pendaftaran MuaraAI",
    title: "Buat profil komunitasmu",
    intro: "Selesaikan empat langkah singkat. Draft kamu tetap tersimpan saat berpindah langkah.",
    rejectionTitle: "Catatan Review Sebelumnya",
    rejectionNote: "Data pendaftaran sebelumnya sudah dimuat. Perbaiki bagian yang kurang lalu kirim permohonan baru.",
    connected: "Akun GitHub terhubung",
    connectedBody: "Kamu sudah masuk lewat GitHub. Lengkapi profil dan Proof of Work di bawah ini untuk dikirim ke tim MuaraAI.",
    progress: "Progress pendaftaran",
    aboutLegend: "Tentang kamu",
    aboutIntro: "MuaraAI terbuka untuk siapa saja, dari mana saja. Ceritakan sedikit tentang dirimu.",
    fullName: "Nama Lengkap",
    status: "Status",
    institution: "Institusi (opsional)",
    institutionPlaceholder: "Kampus, sekolah, atau tempat kerja",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "Nomor aktif, contoh: 08123456789",
    telegram: "Telegram (opsional)",
    proofLegend: "Proof of Work",
    portfolio: "Tautan Repositori atau Portofolio",
    division: "Divisi utama",
    track: "Posisi",
    secondaryDivision: "Divisi kedua (opsional)",
    secondaryTrack: "Posisi divisi kedua",
    none: "Tidak ada",
    toolchain: "Toolchain dan workflow yang dikuasai",
    reason: "Alasan bergabung",
    profileLegend: "Profil publik",
    profileIntro: "Semua field di sini opsional. Isi yang ingin kamu tampilkan di profil anggota.",
    website: "Website pribadi",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    x: "X / Twitter",
    reviewLegend: "Review pendaftaran",
    summaryName: "Nama",
    summaryStatus: "Status",
    summaryProof: "Proof of Work",
    summaryPosition: "Posisi",
    summaryReason: "Alasan bergabung",
    notFilled: "Belum diisi",
    disclaimer: "Dengan mengirim formulir, kamu menyatakan data dan karya yang kamu kirim benar serta bersedia mengikuti proses review komunitas.",
    agreeBefore: "Saya menyetujui ",
    agreeAnd: ", dan ",
    agreeAfter: " MuaraAI.",
    back: "Kembali",
    next: "Lanjut",
    submit: "Kirim pendaftaran",
    submitting: "Mengirim...",
    toGithub: "Lanjut ke GitHub",
    agreeRequired: "Setujui Privacy Policy, Terms of Service, dan Code of Conduct sebelum lanjut.",
    submitFailed: "Gagal mengirimkan Proof of Work.",
    affiliations: { mahasiswa: "Mahasiswa", pelajar: "Pelajar", umum: "Umum", lainnya: "Lainnya" },
    loginHref: "/api/auth/login?next=/onboarding",
    preparingTitle: "Pendaftaran sedang disiapkan",
    preparingBody: "Daftar posisi belum tersedia. Coba lagi beberapa saat lagi.",
    choose: "Pilih…",
  },
  en: {
    steps: ["About you", "Proof of Work", "Public profile", "Review"],
    eyebrow: "MuaraAI registration",
    title: "Create your community profile",
    intro: "Finish four short steps. Your draft is kept while you move between steps.",
    rejectionTitle: "Note from the previous review",
    rejectionNote: "Your earlier application has been loaded. Fix what was missing and send a new request.",
    connected: "GitHub account connected",
    connectedBody: "You are signed in with GitHub. Complete your profile and Proof of Work below to send them to the MuaraAI team.",
    progress: "Registration progress",
    aboutLegend: "About you",
    aboutIntro: "MuaraAI is open to anyone, from anywhere. Tell us a little about yourself.",
    fullName: "Full name",
    status: "Status",
    institution: "Institution (optional)",
    institutionPlaceholder: "School, university or workplace",
    whatsapp: "WhatsApp",
    whatsappPlaceholder: "An active number, e.g. 08123456789",
    telegram: "Telegram (optional)",
    proofLegend: "Proof of Work",
    portfolio: "Link to a repository or portfolio",
    division: "Main division",
    track: "Position",
    secondaryDivision: "Second division (optional)",
    secondaryTrack: "Second division position",
    none: "None",
    toolchain: "Tools and workflow you use",
    reason: "Why you want to join",
    profileLegend: "Public profile",
    profileIntro: "Everything here is optional. Fill in what you want to show on your member profile.",
    website: "Personal website",
    linkedin: "LinkedIn",
    instagram: "Instagram",
    x: "X / Twitter",
    reviewLegend: "Review your application",
    summaryName: "Name",
    summaryStatus: "Status",
    summaryProof: "Proof of Work",
    summaryPosition: "Position",
    summaryReason: "Why you want to join",
    notFilled: "Not filled in",
    disclaimer: "By submitting, you confirm that the information and work you send are true and that you accept the community's review process.",
    agreeBefore: "I agree to the MuaraAI ",
    agreeAnd: " and ",
    agreeAfter: " (these documents are currently only available in Indonesian).",
    back: "Back",
    next: "Next",
    submit: "Submit application",
    submitting: "Sending...",
    toGithub: "Continue to GitHub",
    agreeRequired: "Accept the Privacy Policy, Terms of Service and Code of Conduct before continuing.",
    submitFailed: "Could not submit your Proof of Work.",
    affiliations: { mahasiswa: "Student", pelajar: "Learner", umum: "General", lainnya: "Other" },
    loginHref: "/api/auth/login?next=/en/onboarding",
    preparingTitle: "Registration is being prepared",
    preparingBody: "The position list is not available yet. Please try again in a moment.",
    choose: "Choose…",
  },
};
