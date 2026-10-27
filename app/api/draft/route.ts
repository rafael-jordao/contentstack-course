import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

const DEFAULT_REDIRECT = "/";

/**
 * Enabling draft mode only bypasses the cache. Draft content additionally needs
 * the Contentstack hash, which the proxy forwards, so no secret is required
 * here. The residual exposure is an uncached render, not a content leak.
 */
export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("redirect");

  const draft = await draftMode();
  draft.enable();

  redirect(target?.startsWith("/") ? target : DEFAULT_REDIRECT);
}
