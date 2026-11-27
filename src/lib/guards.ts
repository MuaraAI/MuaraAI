/** Maintainer access: hierarchy "maintainer" OR the legacy roles list contains "maintainer" (the same rule the database uses). */
export function isMaintainer(member: { hierarchy?: string | null; roles?: string[] | null } | null | undefined): boolean {
  if (!member) return false;
  return member.hierarchy === "maintainer" || (member.roles || []).includes("maintainer");
}
