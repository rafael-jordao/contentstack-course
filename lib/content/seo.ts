import type { Metadata } from "next";
import type { ContentstackAsset } from "@/lib/contentstack";

export type SeoMetadata = {
  meta_title?: string;
  meta_description?: string;
  og_image?: ContentstackAsset | null;
  no_index?: boolean;
};

type ToMetadataInput = {
  seo?: SeoMetadata | null;
  /** Used when the editor left meta_title empty. */
  fallbackTitle: string;
  fallbackImage?: ContentstackAsset | null;
  openGraph?: Metadata["openGraph"];
};

export function toMetadata({
  seo,
  fallbackTitle,
  fallbackImage,
  openGraph,
}: ToMetadataInput): Metadata {
  const title = seo?.meta_title?.trim() || fallbackTitle;
  const description = seo?.meta_description?.trim() || undefined;
  const image = seo?.og_image ?? fallbackImage;

  return {
    title,
    description,
    robots: seo?.no_index ? { index: false, follow: false } : undefined,
    openGraph: {
      title,
      description,
      images: image?.url ? [{ url: image.url }] : undefined,
      ...openGraph,
    },
  };
}
