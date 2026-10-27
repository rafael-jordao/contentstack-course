import { Suspense } from "react";
import type { Metadata } from "next";
import { BlogPostGridSkeleton } from "@/components/blog/blog-post-grid-skeleton";
import { BlogPostList } from "@/components/blog/blog-post-list";

export const metadata: Metadata = {
  title: "Blog",
  description: "Articles published from Contentstack.",
};

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
