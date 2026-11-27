import type { Metadata } from "next";
import KaryaView from "@/components/karya/karya-view";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Karya | MuaraAI",
  description: "Karya anggota dan komunitas MuaraAI: repo publik di GitHub yang bisa kamu pakai, pelajari, dan ikut kembangkan.",
  alternates: {
    canonical: "https://muaraai.com/karya",
    languages: { id: "https://muaraai.com/karya", en: "https://muaraai.com/en/karya", "x-default": "https://muaraai.com/karya" },
  },
};

export default async function KaryaPage() {
  return KaryaView({ locale: "id" });
}
