import { getSiteConfig } from "@/lib/content/site-config";
import { getSiteUrl } from "@/lib/site-url";

export async function GET() {
  const config = await getSiteConfig();
  const origin = new URL(getSiteUrl());

  // `entries` may be empty per the ARD spec; this site exposes no agent API yet.
  const catalog = {
    specVersion: "1.0",
    host: {
      displayName: config?.siteName ?? "Contentstack Course",
      identifier: origin.hostname,
      documentationUrl: new URL("/llms.txt", origin).toString(),
    },
    entries: [],
  };

  return Response.json(catalog, {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "access-control-allow-origin": "*",
    },
  });
}
