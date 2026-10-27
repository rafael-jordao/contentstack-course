import contentstack, { type Stack } from "@contentstack/delivery-sdk";
import { headers } from "next/headers";
import { LIVE_PREVIEW_HEADERS } from "@/proxy";
import { requireEnv, resolveRegion, resolveRegionCode } from "./client";

const PREVIEW_HOSTS: Record<string, string> = {
  US: "rest-preview.contentstack.com",
  NA: "rest-preview.contentstack.com",
  EU: "eu-rest-preview.contentstack.com",
  AU: "au-rest-preview.contentstack.com",
  AZURE_NA: "azure-na-rest-preview.contentstack.com",
  AZURE_EU: "azure-eu-rest-preview.contentstack.com",
  GCP_NA: "gcp-na-rest-preview.contentstack.com",
  GCP_EU: "gcp-eu-rest-preview.contentstack.com",
};

export type LivePreviewQuery = {
  live_preview?: string;
  content_type_uid?: string;
  entry_uid?: string;
  preview_timestamp?: string;
};

export function isPreviewRequest(query: LivePreviewQuery): boolean {
  return Boolean(query.live_preview);
}

/** Reads the hash the proxy forwarded. Must run outside any `use cache` scope. */
export async function readLivePreviewQuery(): Promise<LivePreviewQuery> {
  const headerList = await headers();
  const read = (name: string) => headerList.get(name)?.trim() || undefined;

  return {
    live_preview: read(LIVE_PREVIEW_HEADERS.hash),
    content_type_uid: read(LIVE_PREVIEW_HEADERS.contentTypeUid),
    entry_uid: read(LIVE_PREVIEW_HEADERS.entryUid),
    preview_timestamp: read(LIVE_PREVIEW_HEADERS.timestamp),
  };
}

export function previewHost(): string {
  const code = resolveRegionCode();
  const host = PREVIEW_HOSTS[code];

  if (!host) {
    throw new Error(`No preview host known for region "${code}".`);
  }

  return host;
}

/**
 * A fresh instance per request. A shared one leaks an editor's draft into other
 * visitors' responses.
 */
export function createPreviewClient(query: LivePreviewQuery): Stack {
  const stack = contentstack.stack({
    apiKey: requireEnv("CONTENTSTACK_API_KEY"),
    deliveryToken: requireEnv("CONTENTSTACK_DELIVERY_TOKEN"),
    environment: requireEnv("CONTENTSTACK_ENVIRONMENT"),
    region: resolveRegion(),
    live_preview: {
      enable: true,
      preview_token: requireEnv("CONTENTSTACK_PREVIEW_TOKEN"),
      host: previewHost(),
    },
  });

  stack.livePreviewQuery(query as Parameters<Stack["livePreviewQuery"]>[0]);

  return stack;
}
