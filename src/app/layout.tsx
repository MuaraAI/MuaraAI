import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Muara AI — Where local craft flows global",
  description: "Official syndicate portal for Muara AI. Engineering research, agentic workflows, and verified proof-of-work software.",
  metadataBase: new URL("https://muaraai.com"),
  openGraph: {
    title: "Muara AI — Where local craft flows global",
    description: "Official syndicate portal for Muara AI. Engineering research, agentic workflows, and verified proof-of-work software.",
    url: "https://muaraai.com",
    siteName: "Muara AI",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-muara-cyan/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
