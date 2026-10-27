import type { ImageLoaderProps } from "next/image";
import { contentstackImageUrl } from "./image";

/**
 * Registered as `images.loaderFile`, so Next builds every srcset entry through
 * here instead of its own optimizer. Local assets are passed through untouched
 * because this loader replaces the default one for all images.
 */
export default function contentstackImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  if (!src.startsWith("http")) return src;

  return contentstackImageUrl(src, {
    width,
    quality: quality ?? 80,
    auto: "webp",
  });
}
