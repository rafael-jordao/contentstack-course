import { describe, expect, it } from "vitest";
import contentstackImageLoader from "./image-loader";

const ASSET_URL = "https://eu-images.contentstack.com/v3/assets/blt1/blt2/cover.jpg";

describe("contentstackImageLoader", () => {
  it("asks the delivery api for the requested width", () => {
    const url = new URL(contentstackImageLoader({ src: ASSET_URL, width: 640 }));

    expect(url.hostname).toBe("eu-images.contentstack.com");
    expect(url.searchParams.get("width")).toBe("640");
  });

  it("requests webp negotiation", () => {
    const url = new URL(contentstackImageLoader({ src: ASSET_URL, width: 640 }));

    expect(url.searchParams.get("auto")).toBe("webp");
  });

  it("defaults the quality when none is given", () => {
    const url = new URL(contentstackImageLoader({ src: ASSET_URL, width: 640 }));

    expect(url.searchParams.get("quality")).toBe("80");
  });

  it("honours an explicit quality", () => {
    const url = new URL(
      contentstackImageLoader({ src: ASSET_URL, width: 640, quality: 45 }),
    );

    expect(url.searchParams.get("quality")).toBe("45");
  });

  it("produces a distinct url per srcset width", () => {
    const widths = [640, 1080, 1920].map((width) =>
      new URL(contentstackImageLoader({ src: ASSET_URL, width })).searchParams.get(
        "width",
      ),
    );

    expect(widths).toEqual(["640", "1080", "1920"]);
  });

  it("passes local assets through untouched", () => {
    expect(contentstackImageLoader({ src: "/next.svg", width: 100 })).toBe(
      "/next.svg",
    );
  });
});
