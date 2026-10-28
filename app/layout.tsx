import type { Metadata } from "next";
import { SiteFooterSlot } from "@/components/layout/site-footer";
import { SiteHeaderSlot } from "@/components/layout/site-header";
import { SiteScriptsSlot } from "@/components/layout/site-scripts";
import { LivePreviewSlot } from "@/components/live-preview-slot";
import { SITE_NAME_FALLBACK } from "@/lib/content/site-config";
import { fontVariables } from "@/lib/fonts";
import { getSiteUrl } from "@/lib/site-url";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_NAME_FALLBACK,
    template: `%s · ${SITE_NAME_FALLBACK}`,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <head>
        <link rel="ai-catalog" href="/.well-known/ai-catalog.json" />
      </head>
      <body className="flex min-h-full flex-col">
        <SiteHeaderSlot />

        <div className="flex-1">{children}</div>

        <SiteFooterSlot />

        <SiteScriptsSlot />

        <LivePreviewSlot />
      </body>
    </html>
  );
}
