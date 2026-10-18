import { Resend } from "resend";

export interface NotifyResult {
  resend?: boolean;
  discord?: boolean;
  telegram?: boolean;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character] ?? character);
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
      html: `<div style="font-family:sans-serif;padding:16px;"><h2>${escapeHtml(title)}</h2><p style="white-space:pre-wrap;">${escapeHtml(text)}</p></div>`,
    }).then(() => { result.resend = true; }).catch(() => { result.resend = false; }));
  }

  if (discordWebhookUrl) {
    tasks.push(fetch(discordWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `**[MUARA AI ALERT] ${title}**\n${text}`,
        allowed_mentions: { parse: [] },
      }),
    }).then((response) => { result.discord = response.ok; }).catch(() => { result.discord = false; }));
  }

  if (telegramBotToken && telegramChatId) {
    tasks.push(fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: telegramChatId,
        ...(telegramTopicId ? { message_thread_id: Number(telegramTopicId) } : {}),
        text: `*${escapeTelegramMarkdown(title)}*\n\n${escapeTelegramMarkdown(text)}`,
        parse_mode: "MarkdownV2",
      }),
    }).then((response) => { result.telegram = response.ok; }).catch(() => { result.telegram = false; }));
  }

  await Promise.allSettled(tasks);
  return result;
}
