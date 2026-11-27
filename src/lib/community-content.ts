interface Product {
  slug: string;
  name: string;
  /** Live site. */
  url: string;
  /** GitHub repository in the MuaraAI org. */
  repo: string;
  /** Screenshot of the live site (public/products, 960x600). Refresh it when the site's front page changes a lot. */
  image: string;
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
    image: "/products/mira.jpg",
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
    image: "/products/fluxcode.jpg",
    tags: ["Rust", "Editor kode", "Agen AI"],
    id: "Editor kode native yang ditulis dengan Rust, dengan agen AI bawaan, untuk Windows, macOS, dan Linux.",
    en: "A native code editor written in Rust with built-in AI agents, for Windows, macOS and Linux.",
  },
];

/** Public repos that should not show up in the "Repo lainnya" list: the org profile and the unreleased AI portal. */
export const hiddenRepoNames: readonly string[] = [".github", "ai-web"];

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
} as const;
