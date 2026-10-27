import { Suspense } from "react";
import type { Metadata } from "next";
import { PageContent } from "@/components/page-content";
import { getPageByUrl, getPageUrls, toPageUrl } from "@/lib/content/page";
import { toMetadata } from "@/lib/content/seo";
import { attempt } from "@/lib/result";

type Params = Promise<{ slug?: string[] }>;

type CatchAllPageProps = {
  params: Params;
};

/** The homepage route, which exists whether or not an entry backs it. */
const HOME_PARAMS = [{ slug: [] as string[] }];

/**
 * Cache Components rejects an empty result, and `notFound()` is not available
 * outside render. So an unreachable or empty stack still yields the homepage
 * route, and PageContent answers it with a 404 instead of the app crashing.
 */
export async function generateStaticParams() {
  const result = await attempt(getPageUrls());

  if (!result.ok) {
    console.error("Could not list page urls from Contentstack", result.error);

    return HOME_PARAMS;
  }

  if (result.data.length === 0) {
    console.warn('No published "page" entries found in this environment');

    return HOME_PARAMS;
  }

  return result.data.map((url) => ({
    slug: url === "/" ? [] : url.replace(/^\//, "").split("/"),
  }));
}

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const { slug } = await params;
  const url = toPageUrl(slug);
  const result = await attempt(getPageByUrl(url));

  if (!result.ok) {
    console.error(`Failed to load metadata for "${url}"`, result.error);

    return {};
  }

  if (!result.data) {
    return { title: "Page not found" };
  }

  return toMetadata({
    seo: result.data.seo,
    fallbackTitle: result.data.title,
    openGraph: { type: "website" },
  });
}

export default function CatchAllPage({ params }: CatchAllPageProps) {
  return (
    <Suspense fallback={null}>
      <PageContent params={params} />
    </Suspense>
  );
}
