import contentstack from "@contentstack/delivery-sdk";

/** Minimum shape the SDK serializer needs: a uid plus the field being rendered. */
export type RichTextSource = {
  uid: string;
  [field: string]: unknown;
};

/**
 * Serializes a JSON RTE field to HTML with the SDK's own renderer.
 *
 * Takes the whole entry rather than the bare document because the serializer
 * resolves embedded entries and assets from the entry's `_embedded_items`.
 * `jsonToHTML` rewrites the field in place, hence the shallow copy.
 */
export function jsonRteToHtml(entry: RichTextSource, path: string): string {
  if (!entry[path]) return "";

  const copy = { ...entry };
  contentstack.Utils.jsonToHTML({ entry: copy, paths: [path] });

  const html = copy[path];

  return typeof html === "string" ? html : "";
}
