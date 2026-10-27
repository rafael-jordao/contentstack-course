import { beforeEach, describe, expect, it, vi } from "vitest";

const findEntries = vi.fn();
const findEntryBySlug = vi.fn();

vi.mock("@/lib/contentstack", () => ({
  findEntries: (...args: unknown[]) => findEntries(...args),
  findEntryBySlug: (...args: unknown[]) => findEntryBySlug(...args),
}));

const { BLOG_POST_CONTENT_TYPE, getBlogPostBySlug, getBlogPostSlugs, getBlogPosts } =
  await import("./blog-post");

beforeEach(() => {
  vi.clearAllMocks();
  findEntries.mockResolvedValue([]);
  findEntryBySlug.mockResolvedValue(null);
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

describe("getBlogPostBySlug", () => {
  it("requests embedded items so rich text embeds resolve", async () => {
    await getBlogPostBySlug("hello");

    expect(findEntryBySlug).toHaveBeenCalledWith(BLOG_POST_CONTENT_TYPE, "hello", {
      includeEmbeddedItems: true,
    });
  });

  it("returns null when the slug does not exist", async () => {
    await expect(getBlogPostBySlug("missing")).resolves.toBeNull();
  });
});

describe("getBlogPostSlugs", () => {
  it("returns only the slug of each post", async () => {
    findEntries.mockResolvedValue([{ slug: "one" }, { slug: "two" }]);

    await expect(getBlogPostSlugs()).resolves.toEqual(["one", "two"]);
  });

  it("drops entries with an empty slug", async () => {
    findEntries.mockResolvedValue([{ slug: "one" }, { slug: "" }, {}]);

    await expect(getBlogPostSlugs()).resolves.toEqual(["one"]);
  });

  it("returns an empty array when there are no posts", async () => {
    await expect(getBlogPostSlugs()).resolves.toEqual([]);
  });
});
