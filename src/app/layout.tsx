import type { Metadata } from "next";
import React from "react";
import { headers } from "next/headers";
import { LOCALE_HEADER, localeFromHeader } from "@/lib/locale";
import { Suspense } from "react";
import "./globals.css";
import RouteProgress from "@/components/ui/route-progress";
import { FeedbackProvider } from "@/components/ui/feedback";

export const metadata: Metadata = {
  title: "MuaraAI: Komunitas Terbuka untuk Builder dan Kreator",
  description: "Komunitas terbuka untuk siapa saja yang mau belajar, membangun project, dan berkontribusi lewat GitHub bersama MuaraAI.",
  metadataBase: new URL("https://muaraai.com"),
  keywords: ["MuaraAI", "komunitas open source Indonesia", "komunitas AI", "Mira UBSI", "FluxCode", "Proof of Work", "kontribusi GitHub"],
  alternates: { canonical: "https://muaraai.com/" },
  icons: { icon: "/brand/muara-logo.png", apple: "/brand/muara-logo.png" },
  openGraph: {
    title: "MuaraAI: Komunitas Terbuka untuk Builder dan Kreator",
    description: "Belajar, membangun, dan berkontribusi bersama anggota dari mana saja.",
    url: "https://muaraai.com/",
    siteName: "MuaraAI",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/brand/muara-logo.png", width: 512, height: 512, alt: "Logo MuaraAI" }],
  },
  twitter: {
    card: "summary",
    title: "MuaraAI: Komunitas Terbuka untuk Builder dan Kreator",
    description: "Komunitas terbuka untuk belajar dan membangun project bersama.",
    images: ["/brand/muara-logo.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = localeFromHeader((await headers()).get(LOCALE_HEADER));
  return (
    <html lang={locale}>
      <body className="bg-background text-foreground antialiased selection:bg-muara-sky selection:text-muara-ocean">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
        <FeedbackProvider>{children}</FeedbackProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "MuaraAI",
          url: "https://muaraai.com/",
          logo: "https://muaraai.com/brand/muara-logo.png",
          sameAs: ["https://x.com/MuaraAI", "https://www.instagram.com/muara.ai/", "https://www.threads.com/@muara.ai", "https://github.com/MuaraAI"],
        }) }} />
      </body>
    </html>
  );
}
