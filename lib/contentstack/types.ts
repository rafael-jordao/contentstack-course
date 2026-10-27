/** Fields Contentstack adds to every entry, regardless of content type. */
export type ContentstackSystemFields = {
  uid: string;
  locale: string;
  created_at: string;
  updated_at: string;
  _version: number;
  tags: string[];
};

/** Shape of a file field once the Delivery API resolves it. */
export type ContentstackAsset = {
  uid: string;
  url: string;
  title?: string;
  filename?: string;
  content_type?: string;
  file_size?: string;
  dimension?: {
    height: number;
    width: number;
  };
};

/**
 * A JSON RTE field value. Kept opaque on purpose: consumers should render it
 * through the serializer rather than walking the node tree by hand.
 */
export type JsonRteDocument = {
  type: string;
  uid: string;
  attrs?: Record<string, unknown>;
  children?: unknown[];
};
