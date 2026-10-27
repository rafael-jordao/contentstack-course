import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /**
   * Single place that decides how stale Contentstack content may be. Development
   * revalidates almost immediately so a publish shows up on the next reload.
   */
  cacheLife: {
    content: isDevelopment
      ? { stale: 1, revalidate: 1, expire: 60 }
      : { stale: 60, revalidate: 60, expire: 60 * 60 },
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
