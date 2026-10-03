import { Member } from "@/types/database";

export function isMaintainer(member: Partial<Member> | null | undefined): boolean {
  if (!member) return false;
  return member.hierarchy === "maintainer" || (member.roles || []).includes("maintainer");
}
