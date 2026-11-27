import React from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import FlowingBackground from "@/components/ui/flowing-background";
import { getSessionUser } from "@/lib/session-user";

/** The English site: the same shell as the public pages, with English navigation and footer. */
export default async function EnglishLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  return (
    <div lang="en" className="min-h-screen flex flex-col justify-between relative">
      <FlowingBackground />
      <Navbar user={user} locale="en" />
      <main className="flex-1">{children}</main>
      <Footer locale="en" />
    </div>
  );
}
