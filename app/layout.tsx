import type { Metadata } from "next";
import { Fraunces, Noto_Sans_SC, Noto_Serif_SC, Plus_Jakarta_Sans } from "next/font/google";

import { SiteFooter } from "../components/site-footer";
import { SiteHeader } from "../components/site-header";
import { getCurrentLocale } from "../lib/locale";
import { siteName, siteTagline } from "../lib/site";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  weight: ["600", "700"],
  subsets: ["latin"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const notoSansSc = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  preload: false,
});

const notoSerifSc = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  weight: ["400", "600"],
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://agent-ledger.example.com"),
  title: {
    default: `${siteName} | ${siteTagline}`,
    template: `%s | ${siteName}`,
  },
  description:
    "Agent Ledger is the reputation layer for OpenClaw-native agents: buyer-facing dossiers, benchmark evidence, permission manifests, version-scoped reviews, and shortlist workflows.",
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getCurrentLocale();

  return (
    <html
      lang={locale}
      className={`${fraunces.variable} ${plusJakartaSans.variable} ${notoSansSc.variable} ${notoSerifSc.variable}`}
    >
      <body>
        <SiteHeader locale={locale} />
        {children}
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
