import { beforeEach, describe, expect, it, vi } from "vitest";

const revalidatePath = vi.fn();
const revalidateTag = vi.fn();

vi.mock("next/cache", () => ({
  revalidatePath: (...args: unknown[]) => revalidatePath(...args),
  revalidateTag: (...args: unknown[]) => revalidateTag(...args),
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));

const { POST } = await import("./route");

const SECRET = "super-secret-value";

function buildRequest(body: unknown, secret: string | null = SECRET) {
  return new Request("http://localhost:3000/api/revalidate", {
    method: "POST",
    headers: secret ? { authorization: `Bearer ${secret}` } : {},
    body: JSON.stringify(body),
  });
}

const PUBLISH_BODY = {
  module: "entry",
  data: {
    action: "publish",
    content_type: { uid: "blog_post" },
    entry: { url: "/blog/my-post" },
    environment: { name: "development" },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("CONTENTSTACK_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("CONTENTSTACK_ENVIRONMENT", "development");
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("POST /api/revalidate", () => {
  it("revalidates paths and tags for a valid publish", async () => {
    const response = await POST(buildRequest(PUBLISH_BODY));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ revalidated: true });

    expect(revalidatePath).toHaveBeenCalledWith("/blog/my-post");
    expect(revalidatePath).toHaveBeenCalledWith("/blog");
    expect(revalidateTag).toHaveBeenCalledWith("blog_post:/blog/my-post", { expire: 0 });
  });

  it("expires tags immediately rather than serving stale content", async () => {
    await POST(buildRequest(PUBLISH_BODY));

    for (const call of revalidateTag.mock.calls) {
      expect(call[1]).toEqual({ expire: 0 });
    }
  });

  it("rejects a request with the wrong secret", async () => {
    const response = await POST(buildRequest(PUBLISH_BODY, "wrong-secret"));

    expect(response.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects a request with no secret header", async () => {
    const response = await POST(buildRequest(PUBLISH_BODY, null));

    expect(response.status).toBe(401);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("refuses to run when the server has no secret configured", async () => {
    vi.stubEnv("CONTENTSTACK_WEBHOOK_SECRET", "");

    const response = await POST(buildRequest(PUBLISH_BODY));

    expect(response.status).toBe(500);
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("rejects an authorization header that is not a bearer token", async () => {
    const request = new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { authorization: SECRET },
      body: JSON.stringify(PUBLISH_BODY),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
  });

  it("returns 400 for a body that is not json", async () => {
    const request = new Request("http://localhost:3000/api/revalidate", {
      method: "POST",
      headers: { authorization: `Bearer ${SECRET}` },
      body: "not json at all",
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
  });

  it("acknowledges an irrelevant payload without revalidating", async () => {
    const response = await POST(
      buildRequest({ module: "asset", data: { action: "publish" } }),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      revalidated: false,
      reason: "ignored",
    });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("ignores a publish to a different environment", async () => {
    const response = await POST(
      buildRequest({
        ...PUBLISH_BODY,
        data: { ...PUBLISH_BODY.data, environment: { name: "production" } },
      }),
    );

    await expect(response.json()).resolves.toMatchObject({ revalidated: false });
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
