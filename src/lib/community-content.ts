export interface Product {
  slug: string;
  name: string;
  /** Live site. */
  url: string;
  /** GitHub repository in the MuaraAI org. */
  repo: string;
  tags: readonly string[];
  /** One-line descriptions per language. */
  id: string;
  en: string;
  note?: { id: string; en: string };
}

/** What the org actually ships. Checked against github.com/MuaraAI and the live sites on 2026-11-26. */
const products: readonly Product[] = [
  {
    slug: "mira",
    name: "Mira",
    url: "https://mira.muaraai.com",
    repo: "https://github.com/MuaraAI/Mira",
    tags: ["SIAKAD", "MyBest", "REST API", "MCP"],
    id: "Dashboard mahasiswa UBSI untuk SIAKAD dan MyBest, lengkap dengan REST API dan MCP server untuk enam layanan kampus.",
    en: "A student dashboard for UBSI's SIAKAD and MyBest, with a REST API and an MCP server for six campus services.",
    note: { id: "Proyek independen, tidak berafiliasi dengan UBSI.", en: "Independent project, not affiliated with UBSI." },
  },
  {
    slug: "fluxcode",
    name: "FluxCode",
    url: "https://fluxcode.muaraai.com",
    repo: "https://github.com/MuaraAI/FluxCode",
    tags: ["Rust", "Editor kode", "Agen AI"],
    id: "Editor kode native yang ditulis dengan Rust, dengan agen AI bawaan, untuk Windows, macOS, dan Linux.",
    en: "A native code editor written in Rust with built-in AI agents, for Windows, macOS and Linux.",
  },
];

/** Announced but not public yet: shown as text only, never as a link. */
const comingSoon = [
  {
    name: "Muara V1 Flash",
    id: "portal API dan model AI komunitas.",
    en: "the community's AI API portal and model.",
  },
] as const;

export const communityContent = {
  officialLinks: {
    website: "https://muaraai.com/",
    github: "https://github.com/MuaraAI",
    x: "https://x.com/MuaraAI",
    instagram: "https://www.instagram.com/muara.ai/",
    threads: "https://www.threads.com/@muara.ai",
    huggingFace: "https://huggingface.co/MuaraAI",
    email: "mailto:admin@muaraai.com",
  },
  products,
  comingSoon,
  coreMaintainers: [
    { name: "Yuken Velino", github: "Curzyori", title: "Founder", roles: ["Maintainer", "Builder", "AI Engineer"], division: "Builder" },
    { name: "Muhammad Raffli Aldiansyah", github: "Seeyaa77", title: "Co-Founder", roles: ["Maintainer", "Builder", "Backend"], division: "Builder" },
    { name: "Verzio Yamanansyah", github: "MyKineID", title: "Co-Founder", roles: ["Maintainer", "Desainer"], division: "Builder" },
  ],
} as const;
