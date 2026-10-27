import { beforeEach, describe, expect, it, vi } from "vitest";
import { absoluteUrl, getSiteUrl } from "./site-url";

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.stubEnv("SITE_URL", "");
  vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
});

describe("getSiteUrl", () => {
  it("prefers an explicit SITE_URL", () => {
    vi.stubEnv("SITE_URL", "https://example.com");

    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("strips trailing slashes so joins do not double up", () => {
    vi.stubEnv("SITE_URL", "https://example.com///");

    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("falls back to the vercel production url", () => {
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");

    expect(getSiteUrl()).toBe("https://my-site.vercel.app");
  });

  it("prefers SITE_URL over the vercel fallback", () => {
    vi.stubEnv("SITE_URL", "https://example.com");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "my-site.vercel.app");

    expect(getSiteUrl()).toBe("https://example.com");
  });

  it("falls back to localhost when nothing is set", () => {
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});

describe("absoluteUrl", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_URL", "https://example.com");
  });

  it("resolves the site root", () => {
    expect(absoluteUrl("/")).toBe("https://example.com/");
  });

  it("resolves a path with or without a leading slash the same way", () => {
    expect(absoluteUrl("blog")).toBe("https://example.com/blog");
    expect(absoluteUrl("/blog")).toBe("https://example.com/blog");
  });

  it("resolves a nested path", () => {
    expect(absoluteUrl("blog/my-post")).toBe("https://example.com/blog/my-post");
  });
});
