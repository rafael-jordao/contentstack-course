import type { ContentType, Query } from "@contentstack/delivery-sdk";
import { deliveryClient } from "./client";

/** The SDK does not export `Entries` from its root, so derive it. */
type EntriesQuery = ReturnType<ContentType["entry"]>;

export type FindEntriesOptions = {
  locale?: string;
  limit?: number;
  skip?: number;
  /** Reference field UIDs to resolve into full objects. */
  includeReference?: string[];
  /** Resolve entries and assets embedded in JSON RTE fields. */
  includeEmbeddedItems?: boolean;
  /** Field UID to sort by, newest or highest first. */
  orderByDescending?: string;
};

function buildQuery(contentTypeUid: string, options: FindEntriesOptions) {
  const { locale, includeReference, includeEmbeddedItems } = options;

  let entries = deliveryClient.contentType(contentTypeUid).entry();

  if (locale) entries = entries.locale(locale);
  if (includeReference?.length) entries = entries.includeReference(includeReference);
  if (includeEmbeddedItems) entries = entries.includeEmbeddedItems();

  return entries;
}

export async function findEntries<T>(
  contentTypeUid: string,
  options: FindEntriesOptions = {},
): Promise<T[]> {
  const { limit, skip, orderByDescending } = options;

  // Pagination and ordering widen Entries to Query; both still expose find().
  let query: EntriesQuery | Query = buildQuery(contentTypeUid, options);

  if (orderByDescending) query = query.orderByDescending(orderByDescending);
  if (typeof skip === "number") query = query.skip(skip);
  if (typeof limit === "number") query = query.limit(limit);

  const result = await query.find<T>();

  return result.entries ?? [];
}

export type FindEntryBySlugOptions = Pick<
  FindEntriesOptions,
  "locale" | "includeReference" | "includeEmbeddedItems"
>;

/** Returns the first entry whose `slug` field matches, or null when none does. */
export async function findEntryBySlug<T>(
  contentTypeUid: string,
  slug: string,
  options: FindEntryBySlugOptions = {},
): Promise<T | null> {
  const result = await buildQuery(contentTypeUid, options)
    .query({ slug })
    .limit(1)
    .find<T>();

  return result.entries?.[0] ?? null;
}
