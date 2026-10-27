import { beforeEach, describe, expect, it, vi } from "vitest";

const findEntries = vi.fn();

vi.mock("@/lib/contentstack", () => ({
  findEntries: (...args: unknown[]) => findEntries(...args),
}));

const { BLOG_POST_CONTENT_TYPE, getBlogPostByUrl, getBlogPostUrls, getBlogPosts } =
  await import("./blog-post");

beforeEach(() => {
  vi.clearAllMocks();
  findEntries.mockResolvedValue([]);
});

describe("getBlogPosts", () => {
  it("orders by published date, newest first", async () => {
    await getBlogPosts();

    expect(findEntries).toHaveBeenCalledWith(BLOG_POST_CONTENT_TYPE, {
      orderByDescending: "published_date",
    });
  });

  it("lets the caller override the ordering", async () => {
    await getBlogPosts({ orderByDescending: "updated_at", limit: 3 });

    expect(findEntries).toHaveBeenCalledWith(BLOG_POST_CONTENT_TYPE, {
      orderByDescending: "updated_at",
      limit: 3,
    });
  });

  it("passes the entries through untouched", async () => {
    findEntries.mockResolvedValue([{ uid: "a" }]);

    await expect(getBlogPosts()).resolves.toEqual([{ uid: "a" }]);
  });
});

describe("getBlogPostByUrl", () => {
  it("filters by the url field and resolves embeds", async () => {
    await getBlogPostByUrl("/blog/hello");

    expect(findEntries).toHaveBeenCalledWith(BLOG_POST_CONTENT_TYPE, {
      includeEmbeddedItems: true,
      limit: 1,
      where: { url: "/blog/hello" },
    });
  });

  it("returns the first match", async () => {
    findEntries.mockResolvedValue([{ uid: "blt1", url: "/blog/hello" }]);

    await expect(getBlogPostByUrl("/blog/hello")).resolves.toEqual({
      uid: "blt1",
      url: "/blog/hello",
    });
  });

  it("returns null when the url does not exist", async () => {
    await expect(getBlogPostByUrl("/blog/missing")).resolves.toBeNull();
  });
});

describe("getBlogPostUrls", () => {
  it("returns the url of each post", async () => {
    findEntries.mockResolvedValue([{ url: "/blog/one" }, { url: "/blog/two" }]);

    await expect(getBlogPostUrls()).resolves.toEqual(["/blog/one", "/blog/two"]);
  });

  it("drops entries with an empty url", async () => {
    findEntries.mockResolvedValue([{ url: "/blog/one" }, { url: "" }, {}]);

    await expect(getBlogPostUrls()).resolves.toEqual(["/blog/one"]);
  });

  it("returns an empty array when there are no posts", async () => {
    await expect(getBlogPostUrls()).resolves.toEqual([]);
  });
});

describe("url and slug conversion", () => {
  it("round-trips a slug through the stored url", async () => {
    const { toBlogPostSlug, toBlogPostUrl } = await import("./blog-post");

    expect(toBlogPostUrl("my-post")).toBe("/blog/my-post");
    expect(toBlogPostSlug("/blog/my-post")).toBe("my-post");
    expect(toBlogPostSlug(toBlogPostUrl("my-post"))).toBe("my-post");
  });
});
