import { describe, expect, it } from "vitest";
import { toMetadata } from "./seo";
import type { ContentstackAsset } from "@/lib/contentstack";

const IMAGE: ContentstackAsset = {
  uid: "blt_asset",
  url: "https://eu-images.contentstack.com/v3/assets/blt1/blt2/og.jpg",
  title: "Social image",
};

describe("toMetadata", () => {
  it("prefers the editor's meta title", () => {
    const metadata = toMetadata({
      seo: { meta_title: "Custom title" },
      fallbackTitle: "Entry title",
    });

    expect(metadata.title).toBe("Custom title");
  });

  it("falls back to the entry title when no seo is set", () => {
    const metadata = toMetadata({ seo: null, fallbackTitle: "Entry title" });

    expect(metadata.title).toBe("Entry title");
  });

  it("treats a whitespace-only meta title as empty", () => {
    const metadata = toMetadata({
      seo: { meta_title: "   " },
      fallbackTitle: "Entry title",
    });

    expect(metadata.title).toBe("Entry title");
  });

  it("omits the description when none is set", () => {
    const metadata = toMetadata({ seo: {}, fallbackTitle: "Entry title" });

    expect(metadata.description).toBeUndefined();
  });

  it("sets noindex only when the editor asked for it", () => {
    expect(
      toMetadata({ seo: { no_index: true }, fallbackTitle: "T" }).robots,
    ).toEqual({ index: false, follow: false });

    expect(
      toMetadata({ seo: { no_index: false }, fallbackTitle: "T" }).robots,
    ).toBeUndefined();
  });

  it("uses the seo image over the fallback image", () => {
    const metadata = toMetadata({
      seo: { og_image: IMAGE },
      fallbackTitle: "T",
      fallbackImage: { uid: "other", url: "https://example.com/other.jpg" },
    });

    expect(metadata.openGraph?.images).toEqual([{ url: IMAGE.url }]);
  });

  it("uses the fallback image when seo has none", () => {
    const metadata = toMetadata({
      seo: {},
      fallbackTitle: "T",
      fallbackImage: IMAGE,
    });

    expect(metadata.openGraph?.images).toEqual([{ url: IMAGE.url }]);
  });

  it("omits open graph images when there is no image at all", () => {
    const metadata = toMetadata({ seo: {}, fallbackTitle: "T" });

    expect(metadata.openGraph?.images).toBeUndefined();
  });

  it("merges caller-supplied open graph fields", () => {
    const metadata = toMetadata({
      seo: {},
      fallbackTitle: "T",
      openGraph: { type: "article" },
    });

    expect(metadata.openGraph).toMatchObject({ type: "article", title: "T" });
  });
});
