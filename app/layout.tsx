import type { Metadata } from "next";
import { SiteFooterSlot } from "@/components/layout/site-footer";
import { SiteHeaderSlot } from "@/components/layout/site-header";
import { SiteScriptsSlot } from "@/components/layout/site-scripts";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Contentstack Course",
    template: "%s · Contentstack Course",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${fontVariables} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <SiteHeaderSlot />

        <div className="flex-1">{children}</div>

        <SiteFooterSlot />

        <SiteScriptsSlot />
      </body>
    </html>
  );
}
