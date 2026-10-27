import { LivePreviewInit } from "@/components/live-preview-init";
import { resolveRegionCode } from "@/lib/contentstack/client";

const APP_HOSTS: Record<string, string> = {
  US: "app.contentstack.com",
  NA: "app.contentstack.com",
  EU: "eu-app.contentstack.com",
  AU: "au-app.contentstack.com",
  AZURE_NA: "azure-na-app.contentstack.com",
  AZURE_EU: "azure-eu-app.contentstack.com",
  GCP_NA: "gcp-na-app.contentstack.com",
  GCP_EU: "gcp-eu-app.contentstack.com",
};

/** Renders nothing unless a preview token is configured for this deployment. */
export function LivePreviewSlot() {
  if (!process.env.CONTENTSTACK_PREVIEW_TOKEN) return null;

  const apiKey = process.env.CONTENTSTACK_API_KEY;
  const environment = process.env.CONTENTSTACK_ENVIRONMENT;
  const appHost = APP_HOSTS[resolveRegionCode()];

  if (!apiKey || !environment || !appHost) return null;

  return (
    <LivePreviewInit apiKey={apiKey} environment={environment} appHost={appHost} />
  );
}
