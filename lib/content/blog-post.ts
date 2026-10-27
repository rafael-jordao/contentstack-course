import { cacheLife, cacheTag } from "next/cache";
import {
  findEntries,
  findEntryBySlug,
  type ContentstackAsset,
  type ContentstackSystemFields,
  type FindEntriesOptions,
  type JsonRteDocument,
} from "@/lib/contentstack";
import type { SeoMetadata } from "@/lib/content/seo";

export const BLOG_POST_CONTENT_TYPE = "blog_post";

export type BlogPost = ContentstackSystemFields & {
  blog_post_title: string;
  slug: string;
  published_date: string | null;
  cover_image: ContentstackAsset | null;
  body: JsonRteDocument | null;
  blog_tags?: string[];
  seo?: SeoMetadata | null;
};

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

export async function getBlogPostBySlug(slug: string) {
  "use cache";
  cacheLife("content");
  cacheTag(BLOG_POST_CONTENT_TYPE, `${BLOG_POST_CONTENT_TYPE}:${slug}`);

  return findEntryBySlug<BlogPost>(BLOG_POST_CONTENT_TYPE, slug, {
    includeEmbeddedItems: true,
  });
}

/** Slugs for every published post, used to prerender the detail routes. */
export async function getBlogPostSlugs(): Promise<string[]> {
  "use cache";
  cacheLife("content");
  cacheTag(BLOG_POST_CONTENT_TYPE);

  const posts = await findEntries<Pick<BlogPost, "slug">>(BLOG_POST_CONTENT_TYPE);

  return posts.map((post) => post.slug).filter(Boolean);
}
