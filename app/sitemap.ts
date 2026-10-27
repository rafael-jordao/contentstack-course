import type { MetadataRoute } from "next";
import { getBlogPosts } from "@/lib/content/blog-post";
import { getPageUrls } from "@/lib/content/page";
import { absoluteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pageUrls, posts] = await Promise.all([getPageUrls(), getBlogPosts()]);

  const pages = pageUrls.map((url) => ({
    url: absoluteUrl(url),
    changeFrequency: "weekly" as const,
    priority: url === "/" ? 1 : 0.8,
  }));

  const blogIndex = {
    url: absoluteUrl("blog"),
    changeFrequency: "daily" as const,
    priority: 0.7,
  };

  const blogPosts = posts.map((post) => ({
    url: absoluteUrl(post.url),
    lastModified: new Date(post.updated_at),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...pages, blogIndex, ...blogPosts];
}
