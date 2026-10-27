import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { getBlogPosts } from "@/lib/content/blog-post";
import type { PostListFields } from "@/lib/content/page";
import { attempt } from "@/lib/result";

const DEFAULT_LIMIT = 3;

/**
 * Hand-picked posts win; otherwise the most recent are fetched, so an editor
 * can leave the reference empty and still get a populated section.
 */
export async function PostListSection({ heading, limit, posts }: PostListFields) {
  let resolved = posts ?? [];

  if (resolved.length === 0) {
    const result = await attempt(getBlogPosts({ limit: limit ?? DEFAULT_LIMIT }));

    if (!result.ok) {
      console.error("Failed to load posts for the post list section", result.error);

      return null;
    }

    resolved = result.data;
  }

  if (resolved.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-5xl px-6 py-16">
      {heading && (
        <h2 className="mb-12 text-2xl font-semibold tracking-tight">{heading}</h2>
      )}

      <BlogPostGrid posts={resolved} />
    </section>
  );
}
