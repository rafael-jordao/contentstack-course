import Image, { type ImageProps } from "next/image";
import {
  assetDimensions,
  contentstackImageUrl,
  type ContentstackAsset,
} from "@/lib/contentstack";

type ContentstackImageProps = Omit<
  ImageProps,
  "src" | "alt" | "width" | "height" | "loader"
> & {
  asset: ContentstackAsset | null | undefined;
  /** Falls back to the asset title when omitted. Pass "" for decorative images. */
  alt?: string;
  width?: number;
  height?: number;
  quality?: number;
};

/**
 * Resizing is delegated to Contentstack's Image Delivery API instead of the
 * Next.js optimizer, so the CDN serves the variant directly.
 */
export function ContentstackImage({
  asset,
  alt,
  width,
  height,
  quality = 80,
  fill,
  sizes,
  ...props
}: ContentstackImageProps) {
  if (!asset?.url) return null;

  const intrinsic = assetDimensions(asset);
  const resolvedWidth = width ?? intrinsic.width;
  const resolvedHeight = height ?? intrinsic.height;

  const src = contentstackImageUrl(asset.url, {
    width: resolvedWidth,
    quality,
    auto: "webp",
  });

  const resolvedAlt = alt ?? asset.title ?? "";

  if (fill) {
    return <Image {...props} src={src} alt={resolvedAlt} fill sizes={sizes} />;
  }

  if (!resolvedWidth || !resolvedHeight) {
    throw new Error(
      `Asset "${asset.uid}" has no stored dimensions. Pass width and height, or use fill.`,
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={resolvedAlt}
      width={resolvedWidth}
      height={resolvedHeight}
      sizes={sizes}
    />
  );
}
