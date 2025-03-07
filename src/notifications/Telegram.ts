import logger from "../logger.js";

import { Notificator } from "./Notificator.js";
import type { Event, INotifier } from "../types.js";

export interface TelegramOptions {
  safeURL: string;
  telegramBotToken: string;
  telegramChannelId: string;
}

export class Telegram implements INotifier {
  readonly #botToken: string;
  readonly #channelId: string;
  readonly #notificator: Notificator;

  constructor(opts: TelegramOptions) {
    this.#botToken = opts.telegramBotToken;
    this.#channelId = opts.telegramChannelId;
    this.#notificator = new Notificator(opts.safeURL);
  }

  public async send(event: Event): Promise<void> {
    const msg = this.#notificator.getMessage(event);
    await this.#sendToTelegram(msg.toString());
  }

  async #sendToTelegram(text: string): Promise<void> {
    if (!this.#botToken || !this.#channelId) {
      logger.warn("telegram messages not configured");
      return;
    }
    const url = `https://api.telegram.org/bot${this.#botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.#channelId,
          parse_mode: "MarkdownV2",
          text,
        }),
      });

      if (response.ok) {
        logger.debug("telegram sent successfully");
      } else {
        const err = await response.text();
        throw new Error(`${response.statusText}: ${err}`);
      }
    } catch (err) {
      logger.error({ err, text }, "cannot send to telegram");
    }
  }
}
