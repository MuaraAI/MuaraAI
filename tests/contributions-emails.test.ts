import { afterEach, describe, expect, it, vi } from "vitest";

const { sendMock } = vi.hoisted(() => ({ sendMock: vi.fn() }));
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: sendMock };
  },
}));

import { renderKickEmail, renderWarningEmail, sendContributionEmail } from "../src/lib/contributions/emails";
import { DEFAULT_RULES } from "../src/lib/contributions/rules";

const stats = { mergedPrs: 4, externalPrs: 2, commits: 20, newRepos: 0, newWorks: 0 };

describe("sendContributionEmail", () => {
  afterEach(() => {
    sendMock.mockReset();
    delete process.env.RESEND_API_KEY;
  });
  const mail = { subject: "s", html: "<p>h</p>" };

  it("reports false without an API key and never calls Resend", async () => {
    expect(await sendContributionEmail("b@example.com", mail)).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it("reports false when Resend answers with an error object or throws", async () => {
    process.env.RESEND_API_KEY = "key";
    sendMock.mockResolvedValueOnce({ data: null, error: { message: "bad" } });
    expect(await sendContributionEmail("b@example.com", mail)).toBe(false);
    sendMock.mockRejectedValueOnce(new Error("network"));
    expect(await sendContributionEmail("b@example.com", mail)).toBe(false);
  });

  it("reports true when the email was accepted", async () => {
    process.env.RESEND_API_KEY = "key";
    sendMock.mockResolvedValueOnce({ data: { id: "1" }, error: null });
    expect(await sendContributionEmail("b@example.com", mail)).toBe(true);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ to: "b@example.com", subject: "s" }));
  });
});

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
