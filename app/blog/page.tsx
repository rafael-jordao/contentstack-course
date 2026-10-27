import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { BlogPostGridSkeleton } from "@/components/blog/blog-post-grid-skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/content/blog-post";
import { attempt } from "@/lib/result";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles published from Contentstack.",
};

async function BlogPostList() {
  const result = await attempt(getBlogPosts());

  if (!result.ok) {
    console.error("Failed to load blog posts", result.error);

    return (
      <Alert variant="destructive">
        <AlertTitle>Could not load posts</AlertTitle>
        <AlertDescription>
          The content service did not respond. Try again in a moment.
        </AlertDescription>
      </Alert>
    );
  }

  if (result.data.length === 0) {
    return (
      <Card>
        <CardContent className="text-muted-foreground">
          No posts published yet.
        </CardContent>
      </Card>
    );
  }

  return <BlogPostGrid posts={result.data} />;
}

export default function BlogPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <header className="mb-12 flex flex-col gap-3">
        <h1 className="mb-0 text-3xl font-semibold tracking-tight">Blog</h1>
        <p className="mb-0 text-muted-foreground">
          Articles published from Contentstack.
        </p>
      </header>

      <Suspense fallback={<BlogPostGridSkeleton />}>
        <BlogPostList />
      </Suspense>
    </main>
  );
}
