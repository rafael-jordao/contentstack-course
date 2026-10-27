import { describe, expect, it } from "vitest";
import { assetDimensions, contentstackImageUrl } from "./image";
import type { ContentstackAsset } from "./types";

const ASSET_URL = "https://eu-images.contentstack.com/v3/assets/blt1/blt2/cover.jpg";

function asset(overrides: Partial<ContentstackAsset> = {}): ContentstackAsset {
  return {
    uid: "blt_asset",
    url: ASSET_URL,
    title: "Cover",
    ...overrides,
  };
}

describe("contentstackImageUrl", () => {
  it("appends transform parameters", () => {
    const url = new URL(contentstackImageUrl(ASSET_URL, { width: 800, quality: 80 }));

    expect(url.searchParams.get("width")).toBe("800");
    expect(url.searchParams.get("quality")).toBe("80");
  });

  it("leaves the url untouched when no transform is given", () => {
    expect(contentstackImageUrl(ASSET_URL)).toBe(ASSET_URL);
  });

  it("preserves parameters already on the url", () => {
    const url = new URL(
      contentstackImageUrl(`${ASSET_URL}?auto=webp`, { width: 400 }),
    );

    expect(url.searchParams.get("auto")).toBe("webp");
    expect(url.searchParams.get("width")).toBe("400");
  });

  it("overwrites a parameter when the transform sets it again", () => {
    const url = new URL(
      contentstackImageUrl(`${ASSET_URL}?width=100`, { width: 1200 }),
    );

    expect(url.searchParams.getAll("width")).toEqual(["1200"]);
  });

  it("skips undefined values instead of writing them", () => {
    const url = new URL(
      contentstackImageUrl(ASSET_URL, { width: 800, height: undefined }),
    );

    expect(url.searchParams.has("height")).toBe(false);
  });
});

describe("assetDimensions", () => {
  it("reads stored dimensions", () => {
    expect(assetDimensions(asset({ dimension: { width: 1600, height: 900 } }))).toEqual({
      width: 1600,
      height: 900,
    });
  });

  it("returns undefined when the asset has no dimensions", () => {
    expect(assetDimensions(asset())).toEqual({
      width: undefined,
      height: undefined,
    });
  });
});
