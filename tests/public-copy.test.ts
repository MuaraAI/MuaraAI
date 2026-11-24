import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "..");
const read = (file: string) => fs.readFileSync(path.join(root, file), "utf8");

const COPY_FILES = [
  "src/app/layout.tsx",
  "src/components/landing/hero.tsx",
  "src/components/landing/vision-mission.tsx",
  "src/components/landing/manifesto.tsx",
  "src/components/landing/benefits-grid.tsx",
  "src/components/landing/metrics-bar.tsx",
  "src/components/landing/join-flow.tsx",
  "src/components/landing/footer.tsx",
  "src/components/landing/syndicate-roster.tsx",
  "src/components/landing/accolades-grid.tsx",
  "src/components/landing/national-campus-map.tsx",
  "src/app/(public)/privacy/page.tsx",
  "src/app/(portal)/admin/review/page.tsx",
  "src/app/actions/admin.ts",
  "README.md",
];

const STALE = [
  /komunitas mahasiswa/i,
  /lintas kampus/i,
  /mahasiswa UBSI/i,
  /ekosistem UBSI/i,
  /terbuka untuk mahasiswa/i,
  /angkatan/i,
  /\bNIM\b/,
  /2026\+/,
  /kurikulum semester/i,
  /Selamat! Proof of Work Anda/,
];

const VOICE_FILES = COPY_FILES.filter((file) => file.includes("components/landing/") && !file.includes("map") && !file.includes("roster"));

describe("public copy for the open global community", () => {
  it("has no student-only, cohort, or NIM framing left", () => {
    const offenders = COPY_FILES.flatMap((file) =>
      STALE.filter((pattern) => pattern.test(read(file))).map((pattern) => `${file}: ${pattern}`)
    );
    expect(offenders).toEqual([]);
  });

  it("speaks to the reader as 'kamu' on the landing page", () => {
    const offenders = VOICE_FILES.filter((file) => /\bAnda\b/.test(read(file)));
    expect(offenders).toEqual([]);
  });

  it("describes MuaraAI as an open community in the metadata and README", () => {
    expect(read("src/app/layout.tsx")).toMatch(/terbuka/i);
    expect(read("README.md")).toMatch(/terbuka untuk siapa saja/i);
  });

  it("sends the new welcome email to approved members", () => {
    const admin = read("src/app/actions/admin.ts");
    expect(admin).toContain("Kamu resmi bagian dari MuaraAI");
    expect(admin).toContain("Pull Request pertamamu");
  });

  it("explains in the privacy page which new data is collected", () => {
    const privacy = read("src/app/(public)/privacy/page.tsx");
    expect(privacy).toMatch(/Telegram/);
    expect(privacy).toMatch(/alasan bergabung/i);
  });

  it("no longer ships the stale UBSI campus lists", () => {
    const constants = read("src/lib/constants.ts");
    expect(constants).not.toMatch(/INDONESIAN_CAMPUSES|UBSI_CAMPUSES/);
  });
});
