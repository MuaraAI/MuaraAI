export interface PositionsConfig {
  builder: string[];
  creative: string[];
}

export const POSITIONS_SETTING_KEY = "positions";

function cleanList(value: unknown): string[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const cleaned: string[] = [];
  for (const item of value) {
    if (typeof item !== "string" || !item.trim()) return null;
    cleaned.push(item.trim());
  }
  return cleaned;
}

export function parsePositions(value: unknown): PositionsConfig | null {
  if (!value || typeof value !== "object") return null;
  const { builder, creative } = value as Record<string, unknown>;
  const builderList = cleanList(builder);
  const creativeList = cleanList(creative);
  return builderList && creativeList ? { builder: builderList, creative: creativeList } : null;
}

function dedupe(list: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of list) {
    const entry = raw.trim();
    const key = entry.toLowerCase();
    if (!entry || seen.has(key)) continue;
    seen.add(key);
    result.push(entry);
  }
  return result;
}

export function normalizePositions(input: PositionsConfig): PositionsConfig | null {
  const builder = dedupe(input.builder);
  const creative = dedupe(input.creative);
  return builder.length > 0 && creative.length > 0 ? { builder, creative } : null;
}
