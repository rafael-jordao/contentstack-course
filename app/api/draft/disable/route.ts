import { draftMode } from "next/headers";

export async function GET() {
  const draft = await draftMode();

  draft.disable();

  return new Response("Draft mode disabled. Cached content is served again.", {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
