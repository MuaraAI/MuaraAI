import { meetsTarget, type ContributionRules, type Division, type MonthlyStats } from "./rules";

export type Tier = 0 | 1 | 2 | 3 | 4;

export const TIER_NAMES: Record<Exclude<Tier, 0>, string> = { 1: "Riak", 2: "Arus", 3: "Pasang", 4: "Samudra" };

/** Count metrics that scale with the tier multiplier; new repos and new works only need their base target. */
function countPairs(division: Division, stats: MonthlyStats, rules: ContributionRules): [number, number][] {
  if (division === "builder") {
    const target = rules.builder;
    return [
      [stats.mergedPrs, target.mergedPrs],
      [stats.externalPrs, target.externalPrs],
      [stats.commits, target.commits],
    ];
  }
  const target = rules.creative;
  return [
    [stats.mergedPrs, target.mergedPrs],
    [stats.externalPrs, target.externalPrs],
  ];
}

/** 0 = no badge (target missed), 1 Riak (target met), 2 Arus, 3 Pasang, 4 Samudra (multiples of the target). */
export function tierFor(division: Division, stats: MonthlyStats, rules: ContributionRules): Tier {
  if (!meetsTarget(division, stats, rules)) return 0;

  const pairs = countPairs(division, stats, rules);
  const reaches = (multiplier: number) => pairs.every(([value, target]) => value >= Math.ceil(target * multiplier));
  const { arus, pasang, samudra } = rules.tierMultipliers;

  if (reaches(samudra)) return 4;
  if (reaches(pasang)) return 3;
  if (reaches(arus)) return 2;
  return 1;
}
