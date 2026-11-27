import type { Metadata } from "next";
import KaryaView from "@/components/karya/karya-view";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Works | MuaraAI",
  description: "What MuaraAI members and the community have made: public repos on GitHub that you can use, learn from and help build.",
  alternates: {
    canonical: "https://muaraai.com/en/karya",
    languages: { id: "https://muaraai.com/karya", en: "https://muaraai.com/en/karya", "x-default": "https://muaraai.com/karya" },
  },
};

export default async function EnglishKaryaPage() {
  return KaryaView({ locale: "en" });
}
