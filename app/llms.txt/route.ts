import { getBlogPosts } from "@/lib/content/blog-post";
import { getSiteConfig, SITE_NAME_FALLBACK } from "@/lib/content/site-config";
import { absoluteUrl } from "@/lib/site-url";

export async function GET() {
  const [config, posts] = await Promise.all([getSiteConfig(), getBlogPosts()]);

  const siteName = config?.siteName ?? SITE_NAME_FALLBACK;

  const lines = [
    `# ${siteName}`,
    "",
    "> A Next.js site driven by Contentstack, covering content modelling, delivery and composable pages built from reusable sections.",
    "",
    "## Pages",
    "",
    `- [Home](${absoluteUrl("/")}): Overview of the project and the latest articles`,
    `- [Blog](${absoluteUrl("blog")}): Every published article`,
    "",
    "## Articles",
    "",
  ];

  for (const post of posts) {
    const description = post.seo?.meta_description?.trim();

    lines.push(
      `- [${post.title}](${absoluteUrl(post.url)})${
        description ? `: ${description}` : ""
      }`,
    );
  }

  return new Response(`${lines.join("\n")}\n`, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
