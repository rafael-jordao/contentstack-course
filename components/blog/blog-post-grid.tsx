import { BlogPostCard } from "@/components/blog/blog-post-card";
import type { BlogPost } from "@/lib/content/blog-post";

type BlogPostGridProps = {
  posts: BlogPost[];
};

export function BlogPostGrid({ posts }: BlogPostGridProps) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
    >
      {posts.map((post) => (
        <li key={post.uid}>
          <BlogPostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
