import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";

const DRAFT_COOKIE = "__prerender_bypass";
const DEFAULT_REDIRECT = "/";

/**
 * Next sets the draft cookie as SameSite=Lax, which a browser drops inside the
 * cross-site iframe the Contentstack panel uses. Re-issuing the same value as
 * SameSite=None is the workaround tracked in vercel/next.js#49927.
 */
async function allowCookieInsideIframe() {
  const cookieStore = await cookies();
  const draftCookie = cookieStore.get(DRAFT_COOKIE);

  if (!draftCookie?.value) return;

  cookieStore.set({
    name: DRAFT_COOKIE,
    value: draftCookie.value,
    httpOnly: true,
    path: "/",
    secure: true,
    sameSite: "none",
  });
}

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("redirect");

  const draft = await draftMode();

  draft.enable();
  await allowCookieInsideIframe();

  redirect(target?.startsWith("/") ? target : DEFAULT_REDIRECT);
}
