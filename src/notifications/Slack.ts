import { WebClient } from "@slack/web-api";

import logger from "../logger.js";
import { Notificator } from "./Notificator.js";
import type { Event, INotifier } from "../types.js";

export interface SlackOptions {
  safeURL: string;
  slackBotToken: string;
  slackChannelId: string;
  slackClientId: string
}

export class Slack implements INotifier {
  readonly #apiToken: string;
  readonly #channelId: string;
  readonly #notificator: Notificator;

  constructor(opts: SlackOptions) {
    this.#apiToken = opts.slackBotToken;
    this.#channelId = opts.slackChannelId;
    this.#notificator = new Notificator(opts.safeURL);
  }

  public async send(event: Event): Promise<void> {
    const msg = this.#notificator.getMessage(event);
    await this.#sendToSlack(msg.toString());
  }

  async #sendToSlack(text: string): Promise<void> {
    if (!this.#apiToken || !this.#channelId) {
      logger.warn("slack messages not configured");
      return;
    }
    
    const webClient = new WebClient(this.#apiToken);

    try {
      const response = await webClient.chat.postMessage({
        channel: this.#channelId,
        text: text,
        mrkwn: true,
      });
      if (response.ok) {
        logger.debug("slack message sent successfully");
      } else {
        logger.error({ response, text }, "cannot send to slack");
      }
    } catch (err) {
      logger.error({ err, text }, "cannot send to slack");
    }
  }
}

