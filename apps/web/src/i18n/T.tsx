// SPDX-License-Identifier: AGPL-3.0-only
/**
 * App-copy leaf: renders one message from the app dictionary in the active global language.
 * Server components stay server components and drop `<T id="…"/>` where user-facing app copy
 * lives; only this leaf (and the hook below for attribute strings) is a client boundary.
 *
 * A message that names a page or site carries `{link:<key>}` tokens (see message-links.ts);
 * `<T>` renders each as a link to that destination — internal in the same tab, external in a new
 * tab with safe attributes — labelled with the destination's own localized name. Messages with
 * link tokens must therefore render through `<T>`, never through the string translator below.
 *
 * App copy only. Canonical guidance/claim text always comes from the knowledge translations via
 * the KnowledgeRepository — never from the app dictionary.
 */

"use client";

import Link from "next/link";
import { Fragment } from "react";

import { createTranslator } from "@howtobaby/i18n";

import { ExternalLink } from "@/components/ExternalLink";
import { MESSAGE_LINKS } from "@/site";
import { useLanguage } from "./LanguageProvider";
import { splitMessageLinks } from "./message-links";
import { MESSAGES, type AppMessageKey } from "./messages";

export function T({ id }: { id: AppMessageKey }) {
  const { language } = useLanguage();
  const message = MESSAGES[language][id];
  const segments = splitMessageLinks(message);
  if (segments.length === 1 && segments[0]?.kind === "text") return <>{message}</>;
  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === "text") return <Fragment key={index}>{segment.text}</Fragment>;
        const target = MESSAGE_LINKS[segment.key];
        const label = MESSAGES[language][target.labelKey];
        return target.external ? (
          <ExternalLink key={index} href={target.href}>
            {label}
          </ExternalLink>
        ) : (
          <Link key={index} href={target.href}>
            {label}
          </Link>
        );
      })}
    </>
  );
}

/** Translator bound to the active global language — for attribute strings (aria-label, alt, …). */
export function useMessages(): (id: AppMessageKey) => string {
  const { language } = useLanguage();
  return createTranslator(MESSAGES, language);
}
