import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { escapeHtml, notifyMaintainers, renderEmailHtml } from "../src/lib/notify";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({ data: { id: "test-email" }, error: null }),
}));

vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send: sendMock } })),
}));

const fetchMock = vi.fn().mockResolvedValue({ ok: true });

function stubAllChannels() {
  vi.stubEnv("RESEND_API_KEY", "re_test_key");
  vi.stubEnv("MAINTAINER_EMAIL", "maintainer@muaraai.com");
  vi.stubEnv("DISCORD_WEBHOOK_URL", "https://discord.com/api/webhooks/1/abc");
  vi.stubEnv("TELEGRAM_BOT_TOKEN", "bot-token");
  vi.stubEnv("TELEGRAM_CHAT_ID", "42");
}

function callFor(urlPart: string): { url: string; body: any; init: RequestInit } {
  const call = fetchMock.mock.calls.find(([url]) => String(url).includes(urlPart));
  expect(call, `expected a fetch call to ${urlPart}`).toBeDefined();
  return {
    url: String(call![0]),
    body: JSON.parse((call![1] as RequestInit).body as string),
    init: call![1] as RequestInit,
  };
}

describe("Outbound HTML escaping", () => {
  it("escapes markup, quotes, and ampersands", () => {
    expect(escapeHtml('<script>alert("x&y\'z")</script>')).toBe(
      "&lt;script&gt;alert(&quot;x&amp;y&#39;z&quot;)&lt;/script&gt;"
    );
  });

  it("renderEmailHtml escapes both title and body (shared by alert + broadcast)", () => {
    const html = renderEmailHtml("<b>Title</b>", "<img src=x onerror=alert(1)> & 'q'");
    expect(html).toContain("&lt;b&gt;Title&lt;/b&gt;");
    expect(html).toContain("&lt;img src=x onerror=alert(1)&gt; &amp; &#39;q&#39;");
    expect(html).not.toContain("<b>Title</b>");
    expect(html).not.toContain("<img");
  });
});

describe("notifyMaintainers channel safety", () => {
  beforeEach(() => {
    fetchMock.mockClear();
    sendMock.mockClear();
    vi.stubGlobal("fetch", fetchMock);
    stubAllChannels();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("escapes hostile text in the Resend email HTML", async () => {
    await notifyMaintainers("<script>title</script>", "<img src=x onerror=alert(1)>");

    const message = sendMock.mock.calls[0][0];
    expect(message.to).toBe("maintainer@muaraai.com");
    expect(message.html).toContain("&lt;script&gt;title&lt;/script&gt;");
    expect(message.html).not.toContain("<script>");
    expect(message.html).not.toContain("<img");
  });

  it("caps Discord content at 2000 chars and disables mentions", async () => {
    await notifyMaintainers("Judul", "A".repeat(5000));

    const discord = callFor("discord");
    expect(discord.body.content.length).toBeLessThanOrEqual(2000);
    expect(discord.body.allowed_mentions).toEqual({ parse: [] });
  });

  it("caps Telegram text at 4096 chars with no dangling MarkdownV2 escape", async () => {
    await notifyMaintainers("Judul *Khusus_", "*._".repeat(3000));

    const telegram = callFor("api.telegram.org");
    expect(telegram.body.text.length).toBeLessThanOrEqual(4096);
    expect(telegram.body.text.endsWith("\\")).toBe(false);
    expect(telegram.body.parse_mode).toBe("MarkdownV2");
    expect(telegram.body.text.startsWith("*Judul \\*Khusus\\_*")).toBe(true);
  });

  it("applies an abort timeout to every webhook request", async () => {
    await notifyMaintainers("Judul", "Pesan");

    expect(fetchMock.mock.calls.length).toBe(2);
    for (const call of fetchMock.mock.calls) {
      expect(Boolean((call[1] as RequestInit).signal)).toBe(true);
    }
  });
});
