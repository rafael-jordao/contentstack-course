import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Single place that decides how stale Contentstack content may be. Kept
   * identical in development: a shorter revalidate there reads as dynamic to
   * Next and stops the root layout from prerendering.
   */
  cacheLife: {
    content: { stale: 60, revalidate: 60, expire: 60 * 60 },
  },
  /* config options here */
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    loader: "custom",
    loaderFile: "./lib/contentstack/image-loader.ts",
  },
  async rewrites() {
    // App Router ignores folders starting with a dot, so the well-known paths
    // are served from a normal route.
    return [
      { source: "/.well-known/ai-catalog.json", destination: "/api/ai-catalog" },
      { source: "/.well-known/ard.json", destination: "/api/ai-catalog" },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
