import { Resend } from "resend";

export interface NotifyResult {
  resend?: boolean;
  discord?: boolean;
  telegram?: boolean;
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

function escapeTelegramMarkdown(value: string): string {
  return value.replace(/([_*[\]()~`>#+\-=|{}.!])/g, "\\$1");
}

export async function notifyMaintainers(title: string, text: string): Promise<NotifyResult> {
  const result: NotifyResult = {};
  const resendApiKey = process.env.RESEND_API_KEY;
  const maintainerEmail = process.env.MAINTAINER_EMAIL;
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;
  const telegramTopicId = process.env.TELEGRAM_TOPIC_ID;
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

  if (telegramBotToken && telegramChatId) {
    // Strip dangling escape backslashes left by truncation so MarkdownV2 still parses.
    const telegramText = truncate(`*${escapeTelegramMarkdown(title)}*\n\n${escapeTelegramMarkdown(text)}`, 4096).replace(/\\+$/, "");
    tasks.push(fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(10_000),
      body: JSON.stringify({
        chat_id: telegramChatId,
        ...(telegramTopicId ? { message_thread_id: Number(telegramTopicId) } : {}),
        text: telegramText,
        parse_mode: "MarkdownV2",
      }),
    }).then((response) => { result.telegram = response.ok; }).catch(() => { result.telegram = false; }));
  }

  await Promise.allSettled(tasks);
  return result;
}
