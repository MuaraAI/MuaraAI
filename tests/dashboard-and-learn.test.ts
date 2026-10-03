import { describe, it, expect } from "vitest";
import { calculateDuesExtension, calculateMemberBill } from "../src/lib/dues";

describe("Dues Calculation & Arrears", () => {
  it("extends from today if current dues already expired", () => {
    const today = new Date("2026-10-03");
    const expired = new Date("2026-09-01");
    const nextDate = calculateDuesExtension(expired, 7, today);
    expect(nextDate.toISOString().slice(0, 10)).toBe("2026-10-10");
  });

  it("extends from valid_until if current dues still active", () => {
    const today = new Date("2026-10-03");
    const activeUntil = new Date("2026-10-15");
    const nextDate = calculateDuesExtension(activeUntil, 7, today);
    expect(nextDate.toISOString().slice(0, 10)).toBe("2026-10-22");
  });

  it("calculates tiered arrears properly (3k, 6k, 9k, 12k)", () => {
    const today = new Date("2026-10-20");
    // Expired 14 days ago (2 weeks overdue)
    const twoWeeksOverdue = new Date("2026-10-06").toISOString();
    const bill = calculateMemberBill(twoWeeksOverdue, today);
    expect(bill.weeks).toBe(2);
    expect(bill.amount).toBe(6000);
    expect(bill.isBlacklisted).toBe(false);

    // Overdue 35 days (>30 days blacklist)
    const overdueMonth = new Date("2026-09-15").toISOString();
    const billMonth = calculateMemberBill(overdueMonth, today);
    expect(billMonth.isBlacklisted).toBe(true);
    expect(billMonth.amount).toBe(12000);
  });
});
