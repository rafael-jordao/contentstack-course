import { jsonToHTML, type EntryModel } from "@contentstack/utils";

const FIELD = "content";

export type RichTextJson = Record<string, unknown> | null | undefined;

export type JsonRteToHtmlOptions = {
  /**
   * The owning entry's uid. `jsonToHTML` requires one because it resolves
   * embedded items against the entry, so a placeholder is used when the
   * caller only has the field value.
   */
  uid?: string;
  /** The entry's `_embedded_items`, needed to resolve embedded entries and assets. */
  embeddedItems?: Record<string, EntryModel[]>;
};

export function jsonRteToHtml(
  json: RichTextJson,
  options: JsonRteToHtmlOptions = {},
): string {
  if (!json) return "";

  const { uid = "rich-text", embeddedItems } = options;

  const entry = {
    uid,
    [FIELD]: json,
    ...(embeddedItems ? { _embedded_items: embeddedItems } : {}),
  };

  jsonToHTML({ entry, paths: [FIELD] });

  const html = entry[FIELD];

  return typeof html === "string" ? html : "";
}
