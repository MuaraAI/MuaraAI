"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MemberShell from "@/components/portal/member-shell";
import type { Locale } from "@/lib/locale";

type PortalShellProps = {
  member: {
    full_name: string;
    github_username: string;
    is_active: boolean;
    registration_status?: string;
    is_maintainer?: boolean;
  };
  locale?: Locale;
  children: React.ReactNode;
};

export default function PortalShell({ member, locale = "id", children }: PortalShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <MemberShell member={member} locale={locale}>{children}</MemberShell>;
}
