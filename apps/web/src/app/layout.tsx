// SPDX-License-Identifier: AGPL-3.0-only
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "@howtobaby/ui/styles.css";
import "@/components/app-shell.css";
import "@/print/print.css";

import { defaultThemeRegistry, DOM_ATTRIBUTES } from "@howtobaby/themes";

import { AppShell } from "@/components/AppShell";
import { Providers } from "@/components/Providers";
import { ThemeBootScript, ThemeStyles } from "@/components/ThemeStyles";
import { SITE } from "@/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} — ${SITE.tagline}`, template: `%s · ${SITE.name}` },
  description: "Evidence-to-action guidance and practical tools for parents — organized around the child's current stage.",
  applicationName: SITE.name,
  alternates: { canonical: "/" },
  openGraph: { type: "website", siteName: SITE.name, url: SITE.url },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  colorScheme: "light dark",
};

// Server-rendered defaults; the boot script and ThemeProvider replace them on the client, so React must not
// treat the attribute difference as a hydration error.
const htmlAttributes = {
  [DOM_ATTRIBUTES.theme]: defaultThemeRegistry.defaultThemeId,
  [DOM_ATTRIBUTES.colorMode]: "light",
  [DOM_ATTRIBUTES.colorModePreference]: "system",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" {...htmlAttributes} suppressHydrationWarning>
      <head>
        <ThemeStyles />
        <ThemeBootScript />
      </head>
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
