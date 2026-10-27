import { FeatureGridSection } from "@/components/sections/feature-grid-section";
import { HeroSection } from "@/components/sections/hero-section";
import { PostListSection } from "@/components/sections/post-list-section";
import { RichTextSection } from "@/components/sections/rich-text-section";
import {
  normalizeSection,
  sectionUid,
  type NormalizedSection,
  type PageSection,
} from "@/lib/content/page";

type SectionRendererProps = {
  sections: PageSection[] | undefined;
  pageUid: string;
};

function renderSection(section: NormalizedSection, pageUid: string) {
  switch (section.type) {
    case "hero":
      return <HeroSection {...section.fields} />;
    case "rich_text":
      return <RichTextSection {...section.fields} pageUid={pageUid} />;
    case "feature_grid":
      return <FeatureGridSection {...section.fields} />;
    case "post_list":
      return <PostListSection {...section.fields} />;
    default: {
      const exhaustive: never = section;
      throw new Error(`Unhandled page section: ${JSON.stringify(exhaustive)}`);
    }
  }
}

export function SectionRenderer({ sections, pageUid }: SectionRendererProps) {
  if (!sections?.length) return null;

  /**
   * A block present in Contentstack but absent from the union normalizes to
   * null. Skipping it beats breaking the whole page for one unknown section.
   */
  const normalized = sections
    .map((section, index) => {
      const result = normalizeSection(section);

      if (!result) {
        console.warn("Unknown page section, skipping", Object.keys(section));

        return null;
      }

      return { section: result, key: sectionUid(result, index) };
    })
    .filter((entry) => entry !== null);

  return (
    <>
      {normalized.map(({ section, key }) => (
        <div key={key}>{renderSection(section, pageUid)}</div>
      ))}
    </>
  );
}
