import { Resend } from "resend";

export interface NotifyResult {
  resend?: boolean;
  discord?: boolean;
  telegram?: boolean;
}

export async function notifyMaintainers(title: string, text: string): Promise<NotifyResult> {
  const result: NotifyResult = {};

  const resendApiKey = process.env.RESEND_API_KEY;
  const maintainerEmail = process.env.MAINTAINER_EMAIL;
  const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;
  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  const telegramChatId = process.env.TELEGRAM_CHAT_ID;

  const tasks: Promise<unknown>[] = [];

  // 1. Resend Email
  if (resendApiKey && maintainerEmail) {
    const resend = new Resend(resendApiKey);
    tasks.push(
      resend.emails
        .send({
          from: "Muara AI Alert <admin@muaraai.com>",
          to: maintainerEmail,
          subject: title,
          html: `<div style="font-family:sans-serif;padding:16px;">
            <h2>${title}</h2>
            <p style="white-space:pre-wrap;">${text}</p>
          </div>`,
        })
        .then(() => {
          result.resend = true;
        })
        .catch(() => {
          result.resend = false;
        })
    );
  }

  // 2. Discord Webhook
  if (discordWebhookUrl) {
    tasks.push(
      fetch(discordWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: `**[MUARA AI ALERT] ${title}**\n${text}`,
        }),
      })
        .then((res) => {
          result.discord = res.ok;
        })
        .catch(() => {
          result.discord = false;
        })
    );
  }

  // 3. Telegram Bot
  if (telegramBotToken && telegramChatId) {
    tasks.push(
      fetch(`https://api.telegram.org/bot${telegramBotToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: telegramChatId,
          text: `*${title}*\n\n${text}`,
          parse_mode: "Markdown",
        }),
      })
        .then((res) => {
          result.telegram = res.ok;
        })
        .catch(() => {
          result.telegram = false;
        })
    );
  }

  await Promise.allSettled(tasks);
  return result;
}
