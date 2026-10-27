import Link from "next/link";
import { ContentstackImage } from "@/components/contentstack-image";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { BlogPost } from "@/lib/content/blog-post";
import { formatMonthYear } from "@/lib/format-date";

type BlogPostCardProps = {
  post: BlogPost;
};

export function BlogPostCard({ post }: BlogPostCardProps) {
  const publishedDate = formatMonthYear(post.published_date);
  const href = `/blog/${post.slug}`;

  return (
    <Card className="relative pt-0">
      <div className="relative aspect-video w-full bg-muted">
        {post.cover_image?.url ? (
          <ContentstackImage
            asset={post.cover_image}
            alt={post.cover_image.title ?? post.blog_post_title}
            width={800}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground"
          >
            No cover image
          </div>
        )}
      </div>

      <CardHeader>
        <CardTitle className="text-base leading-6">
          <Link href={href} className="after:absolute after:inset-0">
            {post.blog_post_title}
          </Link>
        </CardTitle>
      </CardHeader>

      <CardContent className="mt-auto">
        {publishedDate && (
          <time
            dateTime={post.published_date ?? undefined}
            className="font-mono text-xs text-muted-foreground"
          >
            {publishedDate}
          </time>
        )}
      </CardContent>

      <CardFooter>
        <span
          aria-hidden="true"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          View Details
        </span>
      </CardFooter>
    </Card>
  );
}
