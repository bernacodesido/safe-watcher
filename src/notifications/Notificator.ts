import type { Markdown } from "@vlad-yakovlev/telegram-md";
import { md } from "@vlad-yakovlev/telegram-md";

import type { EventType } from "../types.js";
import type { Signer } from "../safe/index.js";
import type { Event } from "../types.js";

const ACTIONS: Record<EventType, string> = {
  created: "created",
  updated: "updated",
  executed: "executed",
  malicious: "ALERT! ACTION REQUIRED: MALICIOUS TRANSACTION DETECTED!",
};

const NETWORKS: Record<string, string> = {
  arb1: "Arbitrum",
  eth: "Eth Mainnet",
  gor: "Eth Goerli",
  oeth: "Optimism",
};

export class Notificator {
  readonly #safeURL: string;

  constructor(safeURL: string) {
    this.#safeURL = safeURL;
  }

  public getMessage(event: Event): Markdown {
    const { type, chainPrefix, safe, tx } = event;

    const link = md.link(
      "🔗 transaction",
      `${this.#safeURL}/${chainPrefix}:${safe}/transactions/queue`,
    );
    // const report = md.link(
    //   "📄 tx report",
    //   this.anvilManagerAPI.reportURL(this.#chain.network, [tx.safeTxHash]),
    // );
    const proposer = md`Proposed by: ${printSigner(tx.proposer)}`;
    let confirmations = md.join(tx.confirmations.map(printSigner), ", ");
    confirmations = md`Signed by: ${confirmations}`;

    const msg = md`${ACTIONS[type]} ${NETWORKS[chainPrefix]} multisig [${tx.confirmations.length}/${tx.confirmationsRequired}] with safeTxHash ${md.inlineCode(tx.safeTxHash)} and nonce ${md.inlineCode(tx.nonce)}`;

    const components = [msg, proposer, confirmations];
    const links = [link /* , report */];
    // if (pendingReport) {
    //   links.push(md.link("📄 pending report", pendingReport));
    // }
    components.push(md.join(links, " ‖ "));

    return md.join(components, "\n\n");
  }
}

function printSigner({ address, name }: Signer): Markdown {
  return name ? md.bold(name) : md.inlineCode(address);
}
