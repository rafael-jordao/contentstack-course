export type NavigationLink = {
  label: string;
  url: string;
};

/** Internal links get client-side navigation; anything else is treated as external. */
export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
