import contentstack, { Region, type Stack } from "@contentstack/delivery-sdk";

const REGIONS: Record<string, Region> = {
  US: Region.US,
  NA: Region.US,
  EU: Region.EU,
  AU: Region.AU,
  AZURE_NA: Region.AZURE_NA,
  AZURE_EU: Region.AZURE_EU,
  GCP_NA: Region.GCP_NA,
  GCP_EU: Region.GCP_EU,
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}. Add it to .env.local.`);
  }
  return value;
}

/**
 * Required rather than defaulted: the SDK falls back to the US data center, so
 * an unset region silently points a non-US stack at the wrong host.
 */
function resolveRegion(): Region {
  const code = requireEnv("CONTENTSTACK_REGION").trim().toUpperCase();

  const region = REGIONS[code];
  if (!region) {
    throw new Error(
      `Unknown region "${code}". Use one of: ${Object.keys(REGIONS).join(", ")}.`,
    );
  }
  return region;
}

export const deliveryClient: Stack = contentstack.stack({
  apiKey: requireEnv("CONTENTSTACK_API_KEY"),
  deliveryToken: requireEnv("CONTENTSTACK_DELIVERY_TOKEN"),
  environment: requireEnv("CONTENTSTACK_ENVIRONMENT"),
  region: resolveRegion(),
});
