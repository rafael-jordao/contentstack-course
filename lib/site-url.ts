const LOCAL_URL = "http://localhost:3000";

/** Absolute origin used by robots, sitemap and canonical metadata. */
export function getSiteUrl(): string {
  const explicit = process.env.SITE_URL?.trim();

  if (explicit) return explicit.replace(/\/+$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();

  if (vercel) return `https://${vercel}`;

  return LOCAL_URL;
}

export function absoluteUrl(path: string): string {
  return new URL(path, `${getSiteUrl()}/`).toString();
}
