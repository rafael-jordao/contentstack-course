import { jsonRteToHtml, type RichTextSource } from "@/lib/contentstack";

type RichTextProps = {
  /** The entry holding the field, so embedded items resolve. */
  entry: RichTextSource;
  /** UID of the JSON RTE field to render. */
  path: string;
  className?: string;
};

export function RichText({ entry, path, className }: RichTextProps) {
  const html = jsonRteToHtml(entry, path);

  if (!html) return null;

  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
