import React from "react";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import FlowingBackground from "@/components/ui/flowing-background";
import { isDevMockEnabled } from "@/lib/dev-mock";
import { createClient } from "@/lib/supabase/server";

// Only the local dummy mode reads the session here, so production public pages stay static/ISR.
async function getDevUser() {
  if (!isDevMockEnabled()) return null;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user ? { id: user.id } : null;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getDevUser();
  return (
    <div className="min-h-screen flex flex-col justify-between relative">
      <FlowingBackground />
      <Navbar user={user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
