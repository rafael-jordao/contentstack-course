import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const MODEL_DIR = fileURLToPath(new URL("../content-model/", import.meta.url));

const MANAGEMENT_HOSTS = {
  US: "api.contentstack.io",
  NA: "api.contentstack.io",
  EU: "eu-api.contentstack.com",
  AU: "au-api.contentstack.com",
  AZURE_NA: "azure-na-api.contentstack.com",
  AZURE_EU: "azure-eu-api.contentstack.com",
  GCP_NA: "gcp-na-api.contentstack.com",
  GCP_EU: "gcp-eu-api.contentstack.com",
};

/**
 * Creation order, not alphabetical: a global field must exist before a content
 * type references it, and header/footer before site_config and page point at
 * them.
 */
const PLAN = [
  { endpoint: "global_fields", file: "global_fields/seo_metadata.json" },
  { endpoint: "content_types", file: "content_types/header.json" },
  { endpoint: "content_types", file: "content_types/footer.json" },
  { endpoint: "content_types", file: "content_types/blog_post.json" },
  { endpoint: "content_types", file: "content_types/site_config.json" },
  { endpoint: "content_types", file: "content_types/page.json" },
];

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}.`);
  }
  return value;
}

function resolveHost() {
  const code = requireEnv("CONTENTSTACK_REGION").trim().toUpperCase();
  const host = MANAGEMENT_HOSTS[code];
  if (!host) {
    throw new Error(
      `Unknown region "${code}". Use one of: ${Object.keys(MANAGEMENT_HOSTS).join(", ")}.`,
    );
  }
  return host;
}

async function main() {
  const host = resolveHost();
  const headers = {
    api_key: requireEnv("CONTENTSTACK_API_KEY"),
    authorization: requireEnv("CONTENTSTACK_MANAGEMENT_TOKEN"),
    "Content-Type": "application/json",
  };

  let created = 0;
  let skipped = 0;

  for (const { endpoint, file } of PLAN) {
    const body = await readFile(new URL(file, MODEL_DIR), "utf8");
    const uid = Object.values(JSON.parse(body))[0].uid;

    const response = await fetch(`https://${host}/v3/${endpoint}`, {
      method: "POST",
      headers,
      body,
    });

    if (response.ok) {
      console.log(`created  ${endpoint}/${uid}`);
      created += 1;
      continue;
    }

    const payload = await response.json().catch(() => ({}));

    // 422 is also how the API reports a uid that is already taken.
    if (response.status === 409 || /already exist/i.test(payload.error_message ?? "")) {
      console.log(`exists   ${endpoint}/${uid}`);
      skipped += 1;
      continue;
    }

    throw new Error(
      `Failed to create ${endpoint}/${uid} (${response.status}): ${JSON.stringify(payload)}`,
    );
  }

  console.log(`\n${created} created, ${skipped} already present.`);
}

await main();
