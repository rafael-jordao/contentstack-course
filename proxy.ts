import { NextResponse, type NextRequest } from "next/server";

const DRAFT_COOKIE = "__prerender_bypass";

export const LIVE_PREVIEW_HEADERS = {
  hash: "x-cs-live-preview",
  contentTypeUid: "x-cs-content-type-uid",
  entryUid: "x-cs-entry-uid",
  timestamp: "x-cs-preview-timestamp",
} as const;

export function proxy(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;
  const hash = searchParams.get("live_preview");

  if (!hash) return NextResponse.next();

  // The panel probes the url with HEAD before loading the iframe. Redirecting
  // that probe makes it never see a 200, so it reports the page unreachable.
  if (request.method !== "GET") return NextResponse.next();

  // Draft mode has to be enabled by a route handler: the cookie is signed.
  if (!request.cookies.has(DRAFT_COOKIE)) {
    const draftUrl = new URL("/api/draft", request.nextUrl);
    draftUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);

    return NextResponse.redirect(draftUrl);
  }

  /**
   * Vercel strips search params during ISR, draft mode included, so the hash
   * travels as a header instead. See vercel/next.js discussion 70384.
   */
  const headers = new Headers(request.headers);

  headers.set(LIVE_PREVIEW_HEADERS.hash, hash);
  headers.set(
    LIVE_PREVIEW_HEADERS.contentTypeUid,
    searchParams.get("content_type_uid") ?? "",
  );
  headers.set(LIVE_PREVIEW_HEADERS.entryUid, searchParams.get("entry_uid") ?? "");
  headers.set(
    LIVE_PREVIEW_HEADERS.timestamp,
    searchParams.get("preview_timestamp") ?? "",
  );

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: [
    { source: "/:path*", has: [{ type: "query", key: "live_preview" }] },
  ],
};
