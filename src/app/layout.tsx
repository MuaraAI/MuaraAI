import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MuaraAI — Komunitas Mahasiswa Lintas Kampus Indonesia",
  description: "Komunitas mahasiswa lintas kampus Indonesia untuk belajar, membangun project, dan menunjukkan Proof of Work bersama MuaraAI.",
  metadataBase: new URL("https://muaraai.com"),
  keywords: ["MuaraAI", "komunitas mahasiswa Indonesia", "AI akademik", "Muara Arus 1", "Proof of Work mahasiswa"],
  alternates: { canonical: "https://muaraai.com/" },
  icons: { icon: "/brand/muara-logo.png", apple: "/brand/muara-logo.png" },
  openGraph: {
    title: "MuaraAI — Komunitas Mahasiswa Lintas Kampus Indonesia",
    description: "Belajar, membangun, dan berkontribusi bersama mahasiswa dari kampus di seluruh Indonesia.",
    url: "https://muaraai.com/",
    siteName: "MuaraAI",
    locale: "id_ID",
    type: "website",
    images: [{ url: "/brand/muara-logo.png", width: 512, height: 512, alt: "Logo MuaraAI" }],
  },
  twitter: {
    card: "summary",
    title: "MuaraAI — Komunitas Mahasiswa Lintas Kampus Indonesia",
    description: "Komunitas mahasiswa lintas kampus Indonesia untuk belajar dan membangun project.",
    images: ["/brand/muara-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-background text-foreground antialiased selection:bg-muara-sky selection:text-muara-ocean">
        {children}
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
