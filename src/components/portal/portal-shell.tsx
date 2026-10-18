"use client";

import React from "react";
import { usePathname } from "next/navigation";
import MemberShell from "@/components/portal/member-shell";

type PortalShellProps = {
  member: {
    full_name: string;
    github_username: string;
    is_active: boolean;
    registration_status?: string;
  };
  children: React.ReactNode;
};

export default function PortalShell({ member, children }: PortalShellProps) {
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) return <>{children}</>;
  return <MemberShell member={member}>{children}</MemberShell>;
}
