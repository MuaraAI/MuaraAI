import { DUES_WEEKLY_FEE, ARREARS_BLACKLIST_DAYS } from "./constants";

export function calculateDuesExtension(
  currentValidUntil: Date | string | null,
  daysToAdd: number,
  today: Date = new Date()
): Date {
  const baseDate =
    currentValidUntil && new Date(currentValidUntil) > today
      ? new Date(currentValidUntil)
      : new Date(today);

  const result = new Date(baseDate.getTime());
  result.setDate(result.getDate() + daysToAdd);
  return result;
}

export function calculateMemberBill(
  duesValidUntil: string | null,
  today: Date = new Date()
): {
  weeks: number;
  amount: number;
  isBlacklisted: boolean;
} {
  if (!duesValidUntil) {
    return { weeks: 1, amount: DUES_WEEKLY_FEE, isBlacklisted: false };
  }

  const validUntilDate = new Date(duesValidUntil);
  const diffMs = today.getTime() - validUntilDate.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { weeks: 0, amount: 0, isBlacklisted: false };
  }

  const weeks = Math.min(Math.ceil(diffDays / 7), 4);
  const amount = weeks * DUES_WEEKLY_FEE;
  const isBlacklisted = diffDays > ARREARS_BLACKLIST_DAYS;

  return { weeks, amount, isBlacklisted };
}
