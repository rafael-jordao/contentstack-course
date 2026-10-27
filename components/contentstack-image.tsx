import Image, { type ImageProps } from "next/image";
import { assetDimensions, type ContentstackAsset } from "@/lib/contentstack";

type ContentstackImageProps = Omit<
  ImageProps,
  "src" | "alt" | "width" | "height" | "loader"
> & {
  asset: ContentstackAsset | null | undefined;
  /** Falls back to the asset title when omitted. Pass "" for decorative images. */
  alt?: string;
  width?: number;
  height?: number;
};

/**
 * The asset url is handed to Next untouched: the custom loader registered in
 * next.config.ts turns each srcset entry into an Image Delivery API request, so
 * Contentstack resizes and the Next optimizer stays out of the path.
 */
export function ContentstackImage({
  asset,
  alt,
  width,
  height,
  fill,
  sizes,
  ...props
}: ContentstackImageProps) {
  if (!asset?.url) return null;

  const intrinsic = assetDimensions(asset);
  const resolvedWidth = width ?? intrinsic.width;
  const resolvedHeight = height ?? intrinsic.height;
  const resolvedAlt = alt ?? asset.title ?? "";

  if (fill) {
    return <Image {...props} src={asset.url} alt={resolvedAlt} fill sizes={sizes} />;
  }

  if (!resolvedWidth || !resolvedHeight) {
    throw new Error(
      `Asset "${asset.uid}" has no stored dimensions. Pass width and height, or use fill.`,
    );
  }

  return (
    <Image
      {...props}
      src={asset.url}
      alt={resolvedAlt}
      width={resolvedWidth}
      height={resolvedHeight}
      sizes={sizes}
    />
  );
}
