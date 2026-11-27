import React from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import FlowingBackground from "@/components/ui/flowing-background";
import { getSessionUser } from "@/lib/session-user";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();
  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      <FlowingBackground />
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
