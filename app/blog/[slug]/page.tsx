import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostArticle } from "@/components/blog/blog-post-article";
import { BlogPostArticleSkeleton } from "@/components/blog/blog-post-article-skeleton";
import { getBlogPostBySlug, getBlogPostSlugs } from "@/lib/content/blog-post";

type Params = Promise<{ slug: string }>;

type BlogPostPageProps = {
  params: Params;
};

export async function generateStaticParams() {
  const slugs = await getBlogPostSlugs();

  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return { title: "Post not found" };
  }

  return {
    title: post.blog_post_title,
    openGraph: {
      title: post.blog_post_title,
      type: "article",
      publishedTime: post.published_date ?? undefined,
      images: post.cover_image?.url ? [{ url: post.cover_image.url }] : undefined,
    },
  };
}

async function BlogPostContent({ params }: { params: Params }) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return <BlogPostArticle post={post} />;
}

/**
 * The page itself never awaits `params`, so its shell stays URL-independent and
 * can be prerendered. Slugs returned by generateStaticParams resolve the
 * boundary at build time and ship complete HTML; anything published afterwards
 * streams in through the fallback.
 */
export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <Suspense fallback={<BlogPostArticleSkeleton />}>
      <BlogPostContent params={params} />
    </Suspense>
  );
}
