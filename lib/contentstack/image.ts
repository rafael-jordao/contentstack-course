import type { ContentstackAsset } from "./types";

export type ContentstackImageTransform = {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png" | "gif";
  fit?: "bounds" | "crop";
  auto?: "webp";
};

/**
 * Appends Image Delivery API parameters to an asset URL, preserving any the
 * URL already carries.
 */
export function contentstackImageUrl(
  url: string,
  transform: ContentstackImageTransform = {},
): string {
  const parsed = new URL(url);

  for (const [key, value] of Object.entries(transform)) {
    if (value !== undefined) {
      parsed.searchParams.set(key, String(value));
    }
  }

  return parsed.toString();
}

export function assetDimensions(asset: ContentstackAsset) {
  return {
    width: asset.dimension?.width,
    height: asset.dimension?.height,
  };
}
