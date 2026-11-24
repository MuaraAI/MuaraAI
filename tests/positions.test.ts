import { describe, expect, it } from "vitest";
import { normalizePositions, parsePositions } from "../src/lib/positions";

describe("parsePositions", () => {
  it("accepts a valid config and trims entries", () => {
    expect(parsePositions({ builder: [" Web ", "Backend"], creative: ["Video"] })).toEqual({
      builder: ["Web", "Backend"],
      creative: ["Video"],
    });
  });

  it("rejects missing divisions, empty arrays, non-strings, and wrong shapes", () => {
    expect(parsePositions(null)).toBeNull();
    expect(parsePositions("web")).toBeNull();
    expect(parsePositions({ builder: ["Web"] })).toBeNull();
    expect(parsePositions({ builder: [], creative: ["Video"] })).toBeNull();
    expect(parsePositions({ builder: ["Web"], creative: [42] })).toBeNull();
    expect(parsePositions({ builder: ["Web"], creative: ["  "] })).toBeNull();
    expect(parsePositions({ builder: "Web", creative: ["Video"] })).toBeNull();
  });
});

describe("normalizePositions", () => {
  it("trims, drops empty entries, and de-duplicates case-insensitively keeping the first spelling", () => {
    expect(
      normalizePositions({ builder: ["Web", " web ", "", "Backend"], creative: ["Video", "VIDEO"] })
    ).toEqual({ builder: ["Web", "Backend"], creative: ["Video"] });
  });

  it("ignores non-string entries and rejects non-array divisions instead of throwing", () => {
    expect(normalizePositions({ builder: "Web" as never, creative: ["Video"] })).toBeNull();
    expect(normalizePositions({ builder: [1, "Web"] as never, creative: ["Video"] })).toEqual({
      builder: ["Web"],
      creative: ["Video"],
    });
    expect(normalizePositions(null as never)).toBeNull();
  });

  it("returns null when a division ends up empty", () => {
    expect(normalizePositions({ builder: ["", "  "], creative: ["Video"] })).toBeNull();
    expect(normalizePositions({ builder: ["Web"], creative: [] })).toBeNull();
  });
});
