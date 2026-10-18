export type CampusNodeRole = "founding-hub" | "regional-hub" | "network-node";

export const communityContent = {
  officialLinks: {
    website: "https://muaraai.com/",
    playground: "https://ai.muaraai.com/",
    github: "https://github.com/MuaraAI",
    x: "https://x.com/MuaraAI",
    instagram: "https://www.instagram.com/muara.ai/",
    threads: "https://www.threads.com/@muara.ai",
    huggingFace: "https://huggingface.co/MuaraAI",
    ollama: "https://ollama.com/MuaraAI",
    email: "mailto:admin@muaraai.com",
  },
  cohortPolicy: {
    minimumCohort: 2026,
    summary: "Mahasiswa dari seluruh kampus UBSI di Indonesia, mulai angkatan 2026 dan seterusnya.",
  },
  muaraArusOne: {
    name: "Muara Arus 1",
    modelId: "muara-arus-1",
    parameters: "1.5B",
    offline: true,
    category: "AI lokal akademik dan coding",
    programs: ["SI", "SIA", "IF"] as const,
    faculty: "FTI",
    founder: "Yuken Velino",
    founderGithub: "Curzyori",
    playground: "https://ai.muaraai.com/",
    github: "https://github.com/MuaraAI/muara-arus-1",
    huggingFace: "https://huggingface.co/MuaraAI/muara-arus-1",
    ollama: "https://ollama.com/MuaraAI/muara-arus-1",
  },
  ubsiApi: {
    name: "UBSI API",
    unofficial: true,
    description: "REST API tidak resmi untuk enam layanan digital UBSI.",
    liveUrl: "https://ubsi-api.muaraai.com",
    repository: "https://github.com/MuaraAI/UBSI-API",
  },
  coreMaintainers: [
    { name: "Yuken Velino", github: "Curzyori", nim: "15260767", title: "Founder", roles: ["Maintainer", "Builder"], division: "Builder" },
    { name: "Muhammad Raffli Aldiansyah", github: "Seeyaa77", nim: "15260161", title: "Co-Founder", roles: ["Maintainer", "Builder"], division: "Builder" },
    { name: "Verzio Yamanansyah", github: "MyKineID", nim: "15260225", title: "Co-Founder", roles: ["Maintainer", "Builder"], division: "Builder" },
  ],
  campusNodes: [
    { id: "pontianak", label: "UBSI Pontianak", city: "Pontianak", region: "Kalimantan Barat", role: "founding-hub" as CampusNodeRole, offlineGathering: true, verified: true },
    { id: "jakarta", label: "UBSI Jakarta", city: "Jakarta", region: "DKI Jakarta", role: "regional-hub" as CampusNodeRole, offlineGathering: false, verified: true },
    { id: "jakarta-pusat", label: "UBSI Jakarta Pusat", city: "Jakarta", region: "DKI Jakarta", role: "network-node" as CampusNodeRole, offlineGathering: false, verified: true },
    { id: "jakarta-selatan", label: "UBSI Jakarta Selatan", city: "Jakarta", region: "DKI Jakarta", role: "network-node" as CampusNodeRole, offlineGathering: false, verified: true },
    { id: "depok", label: "UBSI Depok", city: "Depok", region: "Jawa Barat", role: "network-node" as CampusNodeRole, offlineGathering: false, verified: true },
    { id: "yogyakarta", label: "UBSI Yogyakarta", city: "Yogyakarta", region: "DI Yogyakarta", role: "network-node" as CampusNodeRole, offlineGathering: false, verified: true },
  ],
} as const;
