import { createHash, timingSafeEqual } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { resolveRevalidation } from "@/lib/content/webhook";

const BEARER_PREFIX = "Bearer ";

function readBearerToken(header: string | null): string | null {
  if (!header?.startsWith(BEARER_PREFIX)) return null;

  return header.slice(BEARER_PREFIX.length).trim() || null;
}

function isAuthorized(provided: string | null, expected: string): boolean {
  if (!provided) return false;

  // Digests, so the comparison cannot leak length or prefix through timing.
  const a = createHash("sha256").update(provided).digest();
  const b = createHash("sha256").update(expected).digest();

  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  const secret = process.env.CONTENTSTACK_WEBHOOK_SECRET;

  if (!secret) {
    console.error("CONTENTSTACK_WEBHOOK_SECRET is not set; refusing to revalidate");

    return Response.json({ revalidated: false }, { status: 500 });
  }

  const token = readBearerToken(request.headers.get("authorization"));

  if (!isAuthorized(token, secret)) {
    return Response.json({ revalidated: false }, { status: 401 });
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ revalidated: false }, { status: 400 });
  }

  const environment = process.env.CONTENTSTACK_ENVIRONMENT ?? "";
  const target = resolveRevalidation(body, environment);

  // Acknowledged, not rejected, so Contentstack stops retrying.
  if (!target) {
    return Response.json({ revalidated: false, reason: "ignored" });
  }

  for (const path of target.paths) {
    revalidatePath(path);
  }

  // Paths purge the route; tags purge the `use cache` entries behind it.
  for (const tag of target.tags) {
    revalidateTag(tag, { expire: 0 });
  }

  return Response.json({
    revalidated: true,
    paths: target.paths,
    tags: target.tags,
  });
}
