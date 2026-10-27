import type { ContentstackAsset, ContentstackSystemFields } from "@/lib/contentstack";
import type { NavigationLink } from "@/lib/content/navigation";

export const HEADER_CONTENT_TYPE = "header";

export type Header = ContentstackSystemFields & {
  title: string;
  logo?: ContentstackAsset | null;
  navigation?: NavigationLink[];
  cta_label?: string;
  cta_url?: string;
};
