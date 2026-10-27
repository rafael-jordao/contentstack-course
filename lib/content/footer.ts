import type { ContentstackSystemFields } from "@/lib/contentstack";
import type { NavigationLink } from "@/lib/content/navigation";

export const FOOTER_CONTENT_TYPE = "footer";

export type Footer = ContentstackSystemFields & {
  title: string;
  navigation?: NavigationLink[];
  copyright?: string;
};
