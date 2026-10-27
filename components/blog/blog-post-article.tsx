import { ContentstackImage } from "@/components/contentstack-image";
import { RichTextRenderer } from "@/components/rich-text-renderer";
import type { BlogPost } from "@/lib/content/blog-post";
import { formatLongDate } from "@/lib/format-date";

type BlogPostArticleProps = {
  post: BlogPost;
};

export function BlogPostArticle({ post }: BlogPostArticleProps) {
  const publishedDate = formatLongDate(post.published_date);

  return (
    <article className="mx-auto w-full max-w-3xl px-16 py-32">
      <header className="flex flex-col gap-6">
        <h1 className="mb-0 text-3xl font-semibold leading-10 tracking-tight">
          {post.title}
        </h1>
        {publishedDate && (
          <time
            dateTime={post.published_date ?? undefined}
            className="font-mono text-sm text-muted-foreground"
          >
            {publishedDate}
          </time>
        )}
      </header>

      {post.cover_image && (
        <ContentstackImage
          asset={post.cover_image}
          alt={post.cover_image.title ?? post.title}
          width={1200}
          height={630}
          className="mt-12 h-auto w-full rounded"
          preload
        />
      )}

      <RichTextRenderer
        json={post.body}
        uid={post.uid}
        embeddedItems={post._embedded_items}
        className="rich-text mt-12"
      />
    </article>
  );
}
