import { BLOG_POST_CONTENT_TYPE } from "@/lib/content/blog-post";
import { FOOTER_CONTENT_TYPE } from "@/lib/content/footer";
import { HEADER_CONTENT_TYPE } from "@/lib/content/header";
import { PAGE_CONTENT_TYPE } from "@/lib/content/page";
import { SITE_CONFIG_CONTENT_TYPE } from "@/lib/content/site-config";

/** Chrome appears on every page, so a change invalidates the whole site. */
const CHROME_CONTENT_TYPES = new Set<string>([
  SITE_CONFIG_CONTENT_TYPE,
  HEADER_CONTENT_TYPE,
  FOOTER_CONTENT_TYPE,
]);

const INVALIDATING_EVENTS = new Set(["publish", "unpublish", "delete"]);

export type ContentstackWebhookPayload = {
  event?: string;
  module?: string;
  data?: {
    action?: string;
    entry?: { uid?: string; slug?: string; url?: string; title?: string };
    content_type?: { uid?: string };
    environment?: { name?: string };
  };
};

export type RevalidationTarget = {
  paths: string[];
  tags: string[];
};

export function resolveRevalidation(
  body: unknown,
  expectedEnvironment: string,
): RevalidationTarget | null {
  if (typeof body !== "object" || body === null) return null;

  const payload = body as ContentstackWebhookPayload;

  if (payload.module !== "entry") return null;

  const event = payload.data?.action ?? payload.event;

  if (!event || !INVALIDATING_EVENTS.has(event)) return null;

  // Skipped when absent, as delete events omit it.
  const environment = payload.data?.environment?.name;

  if (environment && environment !== expectedEnvironment) return null;

  const contentType = payload.data?.content_type?.uid;
  const entry = payload.data?.entry;

  if (contentType && CHROME_CONTENT_TYPES.has(contentType)) {
    return {
      paths: ["/"],
      tags: [SITE_CONFIG_CONTENT_TYPE, HEADER_CONTENT_TYPE, FOOTER_CONTENT_TYPE],
    };
  }

  if (contentType === BLOG_POST_CONTENT_TYPE) {
    // The listing and the homepage both surface posts.
    const paths = ["/blog", "/"];
    const tags = [BLOG_POST_CONTENT_TYPE];

    if (entry?.slug) {
      paths.push(`/blog/${entry.slug}`);
      tags.push(`${BLOG_POST_CONTENT_TYPE}:${entry.slug}`);
    }

    return { paths, tags };
  }

  if (contentType === PAGE_CONTENT_TYPE) {
    const url = entry?.url;

    if (!url) return { paths: [], tags: [PAGE_CONTENT_TYPE] };

    return {
      paths: [url],
      tags: [PAGE_CONTENT_TYPE, `${PAGE_CONTENT_TYPE}:${url}`],
    };
  }

  return null;
}
