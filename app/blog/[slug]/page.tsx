import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostArticle } from "@/components/blog/blog-post-article";
import { BlogPostArticleSkeleton } from "@/components/blog/blog-post-article-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  BLOG_POST_CONTENT_TYPE,
  getBlogPostBySlug,
  getBlogPostSlugs,
} from "@/lib/content/blog-post";
import { toMetadata } from "@/lib/content/seo";
import { attempt } from "@/lib/result";

type Params = Promise<{ slug: string }>;

type BlogPostPageProps = {
  params: Params;
};

/**
 * Cache Components rejects an empty result, and `notFound()` is not available
 * outside render. This stand-in keeps the route buildable with no posts; the
 * render path answers it with a 404.
 */
const PLACEHOLDER_PARAMS = [{ slug: "no-posts-published" }];

export async function generateStaticParams() {
  const result = await attempt(getBlogPostSlugs());

  if (!result.ok) {
    console.error("Could not list blog post slugs from Contentstack", result.error);

    return PLACEHOLDER_PARAMS;
  }

  if (result.data.length === 0) {
    console.warn(`No published entries found for "${BLOG_POST_CONTENT_TYPE}"`);

    return PLACEHOLDER_PARAMS;
  }

  return result.data.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await attempt(getBlogPostBySlug(slug));

  if (!result.ok) {
    console.error(`Failed to load metadata for "${slug}"`, result.error);

    return { title: "Blog" };
  }

  const post = result.data;

  if (!post) {
    return { title: "Post not found" };
  }

  return toMetadata({
    seo: post.seo,
    fallbackTitle: post.blog_post_title,
    fallbackImage: post.cover_image,
    openGraph: {
      type: "article",
      publishedTime: post.published_date ?? undefined,
    },
  });
}

async function BlogPostContent({ params }: { params: Params }) {
  const { slug } = await params;
  const result = await attempt(getBlogPostBySlug(slug));

  if (!result.ok) {
    console.error(`Failed to load blog post "${slug}"`, result.error);

    return (
      <div className="mx-auto w-full max-w-3xl px-16 py-32">
        <Alert variant="destructive">
          <AlertTitle>Could not load this post</AlertTitle>
          <AlertDescription>
            The content service did not respond. Try again in a moment.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!result.data) {
    notFound();
  }

  return <BlogPostArticle post={result.data} />;
}

/**
 * The page never awaits `params`, so its shell stays URL-independent and can be
 * prerendered. Slugs from generateStaticParams resolve the boundary at build
 * time and ship complete HTML; anything published later streams in.
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <Suspense fallback={<BlogPostArticleSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}
