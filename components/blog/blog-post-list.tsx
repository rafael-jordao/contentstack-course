import { BlogPostGrid } from "@/components/blog/blog-post-grid";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { getBlogPosts } from "@/lib/content/blog-post";
import { attempt } from "@/lib/result";

export async function BlogPostList() {
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
