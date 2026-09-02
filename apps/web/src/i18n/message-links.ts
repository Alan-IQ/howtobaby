// SPDX-License-Identifier: AGPL-3.0-only
/**
 * Inline destination links in app copy (docs/GUI_DESIGN.md §6 "Page and site references in copy").
 *
 * A message names a page or site with a `{link:<key>}` token, where `<key>` is a MESSAGE_LINKS
 * destination (`{link:now}`, `{link:feeding}`, `{link:privacy}`, `{link:sourceCode}`, …). The
 * token stands for the destination's own localized name, so the visible anchor text is always
 * that name and never a second spelling typed into the sentence. `<T>` renders the tokens as
 * links; this module is the framework-free parser shared by the renderer and the parity tests.
 * Tokens are parsed from the trusted app dictionary only — no HTML is ever injected.
 */

import { MESSAGE_LINKS, type MessageLinkKey } from "@/site";

/** `{link:<key>}` — distinct from value placeholders (`{count}`), which never carry a colon. */
export const MESSAGE_LINK_TOKEN = /\{link:([A-Za-z]+)\}/g;

export type MessageSegment = { kind: "text"; text: string } | { kind: "link"; key: MessageLinkKey };

export function isMessageLinkKey(key: string): key is MessageLinkKey {
  return Object.hasOwn(MESSAGE_LINKS, key);
}

/** Destination keys named by a message, in order of appearance (with repeats). */
export function messageLinkKeys(message: string): string[] {
  return [...message.matchAll(MESSAGE_LINK_TOKEN)].map((match) => match[1] as string);
}

/**
 * Split a message into plain-text runs and link tokens. An unknown key is kept as literal text
 * so a page can never crash on copy; the dictionary tests reject unknown keys before shipping.
 */
export function splitMessageLinks(message: string): MessageSegment[] {
  const segments: MessageSegment[] = [];
  let cursor = 0;
  for (const match of message.matchAll(MESSAGE_LINK_TOKEN)) {
    const index = match.index;
    const key = match[1] as string;
    if (index > cursor) segments.push({ kind: "text", text: message.slice(cursor, index) });
    if (isMessageLinkKey(key)) segments.push({ kind: "link", key });
    else segments.push({ kind: "text", text: match[0] });
    cursor = index + match[0].length;
  }
  if (cursor < message.length) segments.push({ kind: "text", text: message.slice(cursor) });
  return segments;
}
