import { RichTextRenderer } from "@/components/rich-text-renderer";
import type { RichTextFields } from "@/lib/content/page";

type RichTextSectionProps = RichTextFields & {
  /** The owning page uid, so embedded items resolve. */
  pageUid: string;
};

export function RichTextSection({ content, pageUid }: RichTextSectionProps) {
  return (
    <section className="mx-auto w-full max-w-3xl px-6 py-16">
      <RichTextRenderer
        json={content}
        uid={pageUid}
        className="rich-text"
      />
    </section>
  );
}
