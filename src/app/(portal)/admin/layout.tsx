import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isMaintainer } from "@/lib/guards";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/api/auth/login");
  }

  const { data: member } = await supabase
    .from("members")
    .select("hierarchy, roles")
    .eq("id", user.id)
    .maybeSingle();

  if (!isMaintainer(member)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
