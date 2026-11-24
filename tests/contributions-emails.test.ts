import { describe, expect, it } from "vitest";
import { renderKickEmail, renderWarningEmail } from "../src/lib/contributions/emails";
import { DEFAULT_RULES } from "../src/lib/contributions/rules";

const stats = { mergedPrs: 4, externalPrs: 2, commits: 20, newRepos: 0, newWorks: 0 };

describe("contribution emails", () => {
  it("shows a builder the month, each metric against its target, and the consequence", () => {
    const mail = renderWarningEmail({ name: "Budi", month: "2026-11-01", stats, division: "builder", rules: DEFAULT_RULES });
    expect(mail.subject).toContain("November 2026");
    for (const progress of ["4/10", "2/5", "20/50", "0/1"]) expect(mail.html).toContain(progress);
    expect(mail.html).toContain("keanggotaanmu akan dihentikan");
    expect(mail.html).toContain("https://muaraai.com/dashboard");
    expect(mail.html).toContain("Halo Budi");
  });

  it("does not mention commits to a creative but asks for a new work", () => {
    const mail = renderWarningEmail({
      name: "Sari",
      month: "2026-11-01",
      stats: { ...stats, newWorks: 0 },
      division: "creative",
      rules: DEFAULT_RULES,
    });
    expect(mail.html.toLowerCase()).not.toContain("commit");
    expect(mail.html).toContain("0/1");
    expect(mail.html.toLowerCase()).toContain("karya baru");
  });

  it("escapes the member name", () => {
    const mail = renderWarningEmail({
      name: "<script>alert(1)</script>",
      month: "2026-11-01",
      stats,
      division: "builder",
      rules: DEFAULT_RULES,
    });
    expect(mail.html).not.toContain("<script>");
    expect(mail.html).toContain("&lt;script&gt;");
  });

  it("keeps the kick email short, without internal numbers", () => {
    const mail = renderKickEmail({ name: "Budi", month: "2026-11-01" });
    expect(mail.subject.length).toBeGreaterThan(5);
    expect(mail.html).toContain("dihentikan");
    expect(mail.html).toContain("November 2026");
    expect(mail.html).not.toMatch(/\d+\/\d+/);
  });
});
