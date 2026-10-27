import type { EntryModel } from "@contentstack/utils";
import { jsonRteToHtml, type RichTextJson } from "@/lib/contentstack";

type RichTextRendererProps = {
  json: RichTextJson;
  uid?: string;
  embeddedItems?: Record<string, EntryModel[]>;
  className?: string;
};

export function RichTextRenderer({
  json,
  uid,
  embeddedItems,
  className,
}: RichTextRendererProps) {
  const html = jsonRteToHtml(json, { uid, embeddedItems });

  if (!html) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
