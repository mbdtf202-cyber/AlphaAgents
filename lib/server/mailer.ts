import postmark from "postmark";

import { getAppUrl, getPostmarkConfig, isTestMailerEnabled } from "./env";
import { logEvent } from "./log";
import { recordMagicLinkDelivery } from "./metrics";

export interface MagicLinkDeliveryResult {
  provider: "postmark" | "test";
  previewUrl?: string;
  messageId?: string;
}

let postmarkClient: postmark.ServerClient | undefined;

function getPostmarkClient() {
  if (!postmarkClient) {
    const config = getPostmarkConfig();
    if (!config.serverToken) {
      throw new Error("POSTMARK_SERVER_TOKEN is required for magic link delivery.");
    }
    postmarkClient = new postmark.ServerClient(config.serverToken);
  }
  return postmarkClient;
}

export function buildMagicLinkUrl(rawToken: string): string {
  return `${getAppUrl()}/api/auth/magic-link/verify?token=${rawToken}`;
}

export async function deliverMagicLinkEmail(input: {
  email: string;
  rawToken: string;
  role: "buyer" | "builder";
}) {
  const magicLinkUrl = buildMagicLinkUrl(input.rawToken);

  if (isTestMailerEnabled()) {
    recordMagicLinkDelivery("test", "sent");
    logEvent("info", "magic_link_preview_generated", {
      email: input.email,
      provider: "test",
    });
    return {
      provider: "test",
      previewUrl: magicLinkUrl,
    } satisfies MagicLinkDeliveryResult;
  }

  const config = getPostmarkConfig();
  if (!config.fromEmail || !config.messageStream) {
    throw new Error("POSTMARK_FROM_EMAIL and POSTMARK_MESSAGE_STREAM are required for magic link delivery.");
  }

  const response = await getPostmarkClient().sendEmail({
    From: config.fromEmail,
    To: input.email,
    Subject: input.role === "builder" ? "AlphaAgents builder sign-in link" : "AlphaAgents sign-in link",
    MessageStream: config.messageStream,
    TextBody: `Use this secure AlphaAgents sign-in link: ${magicLinkUrl}`,
    HtmlBody: `<p>Use this secure AlphaAgents sign-in link:</p><p><a href="${magicLinkUrl}">${magicLinkUrl}</a></p>`,
    Tag: "alpha-agents-magic-link",
  });

  recordMagicLinkDelivery("postmark", "sent");
  logEvent("info", "magic_link_email_sent", {
    email: input.email,
    provider: "postmark",
    messageId: response.MessageID,
  });

  return {
    provider: "postmark",
    messageId: response.MessageID,
  } satisfies MagicLinkDeliveryResult;
}
