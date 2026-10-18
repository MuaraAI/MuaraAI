import { Resend } from "resend";

export interface NotifyResult {
  resend?: boolean;
  discord?: boolean;
}

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

// Shared plain-text email wrapper so every Resend send escapes interpolations in one place.
export function renderEmailHtml(title: string, body: string): string {
  return `<div style="font-family:sans-serif;padding:16px;"><h2>${escapeHtml(title)}</h2><p style="white-space:pre-wrap;">${escapeHtml(body)}</p></div>`;
}

function truncate(value: string, max: number): string {
  return value.length > max ? `${value.slice(0, max)}` : value;
}

export async function notifyMaintainers(title: string, text: string): Promise<NotifyResult> {
  const result: NotifyResult = {};
  const resendApiKey = process.env.RESEND_API_KEY;
  const maintainerEmail = process.env.MAINTAINER_EMAIL;
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const tasks: Promise<unknown>[] = [];

  if (resendApiKey && maintainerEmail) {
    const resend = new Resend(resendApiKey);
    tasks.push(resend.emails.send({
      from: "Muara AI Alert <admin@muaraai.com>",
      to: maintainerEmail,
      subject: title,
      html: renderEmailHtml(title, text),
    }).then(() => { result.resend = true; }).catch(() => { result.resend = false; }));
  }

  if (discordWebhookUrl) {
    tasks.push(fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        content: truncate(`**[MUARA AI ALERT] ${title}**\n${text}`, 2000),
        allowed_mentions: { parse: [] },
      }),
    }).then((response) => { result.discord = response.ok; }).catch(() => { result.discord = false; }));
  }

  await Promise.allSettled(tasks);
  return result;
}
