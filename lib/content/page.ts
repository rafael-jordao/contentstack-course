import { cacheLife, cacheTag } from "next/cache";
import {
  findEntries,
  type ContentstackAsset,
  type ContentstackSystemFields,
  type JsonRteDocument,
} from "@/lib/contentstack";
import {
  createPreviewClient,
  type LivePreviewQuery,
} from "@/lib/contentstack/preview";
import type { BlogPost } from "@/lib/content/blog-post";
import type { SeoMetadata } from "@/lib/content/seo";

export const PAGE_CONTENT_TYPE = "page";

/** Reference paths the Delivery API must resolve for sections to be usable. */
const SECTION_REFERENCES = ["sections.post_list.posts"];

type BlockMetadata = {
  _metadata?: { uid: string };
};

export type HeroFields = BlockMetadata & {
  heading: string;
  subheading?: string;
  image?: ContentstackAsset | null;
  cta_label?: string;
  cta_url?: string;
};

export type RichTextFields = BlockMetadata & {
  content?: JsonRteDocument | null;
};

export type FeatureGridFields = BlockMetadata & {
  heading?: string;
  items?: Array<{
    item_title: string;
    item_description?: string;
    icon?: ContentstackAsset | null;
  }>;
};

export type PostListFields = BlockMetadata & {
  heading?: string;
  limit?: number;
  posts?: BlogPost[];
};

/**
 * Contentstack returns each modular block as a single-key object, where the key
 * is the block uid. Discriminating on that key keeps the renderer exhaustive.
 */
export type PageSection =
  | { hero: HeroFields }
  | { rich_text: RichTextFields }
  | { feature_grid: FeatureGridFields }
  | { post_list: PostListFields };

/**
 * The API shape carries no discriminant field, so it is normalized into one.
 * That lets the renderer switch exhaustively and fail at compile time when a
 * block is added to the union but not handled.
 */
export type NormalizedSection =
  | { type: "hero"; fields: HeroFields }
  | { type: "rich_text"; fields: RichTextFields }
  | { type: "feature_grid"; fields: FeatureGridFields }
  | { type: "post_list"; fields: PostListFields };

export function normalizeSection(section: PageSection): NormalizedSection | null {
  if ("hero" in section) return { type: "hero", fields: section.hero };
  if ("rich_text" in section) return { type: "rich_text", fields: section.rich_text };
  if ("feature_grid" in section)
    return { type: "feature_grid", fields: section.feature_grid };
  if ("post_list" in section) return { type: "post_list", fields: section.post_list };

  return null;
}

export function sectionUid(section: NormalizedSection, index: number): string {
  return section.fields._metadata?.uid ?? `${section.type}-${index}`;
}

export type Page = ContentstackSystemFields & {
  title: string;
  url: string;
  seo?: SeoMetadata | null;
  sections?: PageSection[];
};

/** Normalizes a catch-all segment array into the url stored on the entry. */
export function toPageUrl(slug: string[] | undefined): string {
  if (!slug?.length) return "/";

  return `/${slug.join("/")}`;
}

export async function getPageByUrl(url: string) {
  "use cache";
  cacheLife("content");
  cacheTag(PAGE_CONTENT_TYPE, `${PAGE_CONTENT_TYPE}:${url}`);

  const pages = await findEntries<Page>(PAGE_CONTENT_TYPE, {
    includeEmbeddedItems: true,
    includeReference: SECTION_REFERENCES,
    limit: 1,
    where: { url },
  });

  return pages[0] ?? null;
}

/** Urls for every published page, used to prerender the catch-all route. */
export async function getPageUrls(): Promise<string[]> {
  "use cache";
  cacheLife("content");
  cacheTag(PAGE_CONTENT_TYPE);

  const pages = await findEntries<Pick<Page, "url">>(PAGE_CONTENT_TYPE);

  return pages.map((page) => page.url).filter(Boolean);
}

/** Uncached and per-request: preview must never read from the shared cache. */
export async function getPageByUrlForPreview(
  url: string,
  query: LivePreviewQuery,
): Promise<Page | null> {
  const pages = await findEntries<Page>(PAGE_CONTENT_TYPE, {
    includeEmbeddedItems: true,
    includeReference: SECTION_REFERENCES,
    limit: 1,
    where: { url },
    client: createPreviewClient(query),
  });

  return pages[0] ?? null;
}
