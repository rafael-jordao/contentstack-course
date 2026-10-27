import { cacheLife, cacheTag } from "next/cache";
import {
  findEntries,
  type ContentstackAsset,
  type ContentstackSystemFields,
  type FindEntriesOptions,
  type JsonRteDocument,
} from "@/lib/contentstack";
import {
  createPreviewClient,
  type LivePreviewQuery,
} from "@/lib/contentstack/preview";
import type { SeoMetadata } from "@/lib/content/seo";

export const BLOG_POST_CONTENT_TYPE = "blog_post";

export type BlogPost = ContentstackSystemFields & {
  title: string;
  url: string;
  published_date: string | null;
  cover_image: ContentstackAsset | null;
  body: JsonRteDocument | null;
  blog_tags?: string[];
  seo?: SeoMetadata | null;
};

/** Builds the stored url from a route segment, so both sides agree on one shape. */
export function toBlogPostUrl(slug: string): string {
  return `/blog/${slug}`;
}

/** Last segment of the stored url, used for route params and cache tags. */
export function toBlogPostSlug(url: string): string {
  return url.replace(/^\/blog\//, "");
}

/**
 * Reads go through `"use cache"` so they can be prerendered: the Delivery SDK
 * reads the clock internally, which Cache Components rejects in an uncached
 * render. Invalidate with `revalidateTag(BLOG_POST_CONTENT_TYPE)` from a
 * Contentstack publish webhook.
 */
export async function getBlogPosts(options: FindEntriesOptions = {}) {
  "use cache";
  cacheLife("content");
  cacheTag(BLOG_POST_CONTENT_TYPE);

  return findEntries<BlogPost>(BLOG_POST_CONTENT_TYPE, {
    orderByDescending: "published_date",
    ...options,
  });
}

export async function getBlogPostByUrl(url: string) {
  "use cache";
  cacheLife("content");
  cacheTag(BLOG_POST_CONTENT_TYPE, `${BLOG_POST_CONTENT_TYPE}:${url}`);

  const posts = await findEntries<BlogPost>(BLOG_POST_CONTENT_TYPE, {
    includeEmbeddedItems: true,
    limit: 1,
    where: { url },
  });

  return posts[0] ?? null;
}

/** Urls for every published post, used to prerender the detail routes. */
export async function getBlogPostUrls(): Promise<string[]> {
  "use cache";
  cacheLife("content");
  cacheTag(BLOG_POST_CONTENT_TYPE);

  const posts = await findEntries<Pick<BlogPost, "url">>(BLOG_POST_CONTENT_TYPE);

  return posts.map((post) => post.url).filter(Boolean);
}

/** Uncached and per-request: preview must never read from the shared cache. */
export async function getBlogPostByUrlForPreview(
  url: string,
  query: LivePreviewQuery,
): Promise<BlogPost | null> {
  const posts = await findEntries<BlogPost>(BLOG_POST_CONTENT_TYPE, {
    includeEmbeddedItems: true,
    limit: 1,
    where: { url },
    client: createPreviewClient(query),
  });

  return posts[0] ?? null;
}
