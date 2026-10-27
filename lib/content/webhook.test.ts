import { describe, expect, it } from "vitest";
import { resolveRevalidation } from "./webhook";

function publishPayload(
  contentTypeUid: string,
  entry: Record<string, unknown>,
  environment = "development",
) {
  return {
    module: "entry",
    data: {
      action: "publish",
      content_type: { uid: contentTypeUid },
      entry,
      environment: { name: environment },
    },
  };
}

describe("resolveRevalidation", () => {
  it("purges the post, the listing and the homepage on a blog publish", () => {
    const target = resolveRevalidation(
      publishPayload("blog_post", { slug: "my-post" }),
      "development",
    );

    expect(target?.paths).toEqual(["/blog", "/", "/blog/my-post"]);
    expect(target?.tags).toEqual(["blog_post", "blog_post:my-post"]);
  });

  it("still purges the listing when the payload has no slug", () => {
    const target = resolveRevalidation(publishPayload("blog_post", {}), "development");

    expect(target?.paths).toEqual(["/blog", "/"]);
    expect(target?.tags).toEqual(["blog_post"]);
  });

  it("purges the page url on a page publish", () => {
    const target = resolveRevalidation(
      publishPayload("page", { url: "/about" }),
      "development",
    );

    expect(target?.paths).toEqual(["/about"]);
    expect(target?.tags).toEqual(["page", "page:/about"]);
  });

  it("handles the homepage url", () => {
    const target = resolveRevalidation(publishPayload("page", { url: "/" }), "development");

    expect(target?.paths).toEqual(["/"]);
  });

  it("ignores a publish aimed at another environment", () => {
    const target = resolveRevalidation(
      publishPayload("blog_post", { slug: "my-post" }, "production"),
      "development",
    );

    expect(target).toBeNull();
  });

  it("accepts a payload with no environment, as delete events send", () => {
    const target = resolveRevalidation(
      {
        module: "entry",
        data: { action: "delete", content_type: { uid: "page" }, entry: { url: "/gone" } },
      },
      "development",
    );

    expect(target?.paths).toEqual(["/gone"]);
  });

  it("treats unpublish as invalidating", () => {
    const target = resolveRevalidation(
      {
        module: "entry",
        data: {
          action: "unpublish",
          content_type: { uid: "blog_post" },
          entry: { slug: "gone" },
          environment: { name: "development" },
        },
      },
      "development",
    );

    expect(target?.paths).toContain("/blog/gone");
  });

  it("falls back to the top-level event when data.action is absent", () => {
    const target = resolveRevalidation(
      {
        event: "publish",
        module: "entry",
        data: { content_type: { uid: "page" }, entry: { url: "/" } },
      },
      "development",
    );

    expect(target?.paths).toEqual(["/"]);
  });

  it("ignores non-entry modules such as assets", () => {
    const target = resolveRevalidation(
      { module: "asset", data: { action: "publish" } },
      "development",
    );

    expect(target).toBeNull();
  });

  it("ignores events that do not invalidate, such as create", () => {
    const target = resolveRevalidation(
      {
        module: "entry",
        data: { action: "create", content_type: { uid: "page" }, entry: { url: "/" } },
      },
      "development",
    );

    expect(target).toBeNull();
  });

  it("purges the whole shell when the site config changes", () => {
    const target = resolveRevalidation(
      publishPayload("site_config", { uid: "blt1" }),
      "development",
    );

    expect(target?.paths).toEqual(["/"]);
    expect(target?.tags).toEqual(["site_config", "header", "footer"]);
  });

  it("treats a header publish as a shell change", () => {
    const target = resolveRevalidation(
      publishPayload("header", { uid: "blt1" }),
      "development",
    );

    expect(target?.tags).toContain("header");
  });

  it("treats a footer publish as a shell change", () => {
    const target = resolveRevalidation(
      publishPayload("footer", { uid: "blt1" }),
      "development",
    );

    expect(target?.tags).toContain("footer");
  });

  it("ignores an unknown content type", () => {
    const target = resolveRevalidation(
      publishPayload("author", { uid: "blt1" }),
      "development",
    );

    expect(target).toBeNull();
  });

  it("ignores malformed bodies", () => {
    expect(resolveRevalidation(null, "development")).toBeNull();
    expect(resolveRevalidation("not json", "development")).toBeNull();
    expect(resolveRevalidation({}, "development")).toBeNull();
  });
});
