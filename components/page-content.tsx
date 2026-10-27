import { notFound } from "next/navigation";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPageByUrl, toPageUrl } from "@/lib/content/page";
import { attempt } from "@/lib/result";

type PageContentProps = {
  params: Promise<{ slug?: string[] }>;
};

export async function PageContent({ params }: PageContentProps) {
  const { slug } = await params;
  const url = toPageUrl(slug);
  const result = await attempt(getPageByUrl(url));

  if (!result.ok) {
    console.error(`Failed to load page "${url}"`, result.error);

    return (
      <div className="mx-auto w-full max-w-3xl px-6 py-32">
        <Alert variant="destructive">
          <AlertTitle>Could not load this page</AlertTitle>
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

  return (
    <main>
      <SectionRenderer
        sections={result.data.sections}
        pageUid={result.data.uid}
      />
    </main>
  );
}
