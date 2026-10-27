import { cacheLife, cacheTag } from "next/cache";
import {
  findEntries,
  type ContentstackAsset,
  type ContentstackSystemFields,
} from "@/lib/contentstack";
import { FOOTER_CONTENT_TYPE, type Footer } from "@/lib/content/footer";
import { HEADER_CONTENT_TYPE, type Header } from "@/lib/content/header";

export const SITE_CONFIG_CONTENT_TYPE = "site_config";

export const SITE_NAME_FALLBACK = "Contentstack Course";

export type ScriptStrategy = "afterInteractive" | "lazyOnload" | "beforeInteractive";

export type ExternalScript = {
  src: string;
  strategy?: ScriptStrategy;
};

export type SiteScripts = {
  gtm_container_id?: string;
  external_scripts?: ExternalScript[];
  inline_head_html?: string;
};

// Resolved single references still arrive as arrays.
type SiteConfigEntry = ContentstackSystemFields & {
  site_name: string;
  logo?: ContentstackAsset | null;
  default_header?: Header[];
  default_footer?: Footer[];
  scripts?: SiteScripts;
};

export type SiteConfig = {
  siteName: string;
  logo: ContentstackAsset | null;
  header: Header | null;
  footer: Footer | null;
  scripts: SiteScripts;
};

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]+$/;

/** Rejects anything that is not a GTM id, since the id lands inside a script tag. */
export function safeGtmId(value: string | undefined): string | null {
  const id = value?.trim().toUpperCase();

  return id && GTM_ID_PATTERN.test(id) ? id : null;
}

/** Blocks javascript: and data: urls from reaching a script src. */
export function safeScriptSrc(value: string | undefined): string | null {
  if (!value) return null;

  try {
    const url = new URL(value.trim());

    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  "use cache";
  cacheLife("content");
  cacheTag(SITE_CONFIG_CONTENT_TYPE, HEADER_CONTENT_TYPE, FOOTER_CONTENT_TYPE);

  const entries = await findEntries<SiteConfigEntry>(SITE_CONFIG_CONTENT_TYPE, {
    limit: 1,
    includeReference: ["default_header", "default_footer"],
  });

  const entry = entries[0];

  if (!entry) return null;

  return {
    siteName: entry.site_name,
    logo: entry.logo ?? null,
    header: entry.default_header?.[0] ?? null,
    footer: entry.default_footer?.[0] ?? null,
    scripts: entry.scripts ?? {},
  };
}

