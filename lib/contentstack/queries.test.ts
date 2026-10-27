import { beforeEach, describe, expect, it, vi } from "vitest";

const find = vi.fn();
const chain = {
  locale: vi.fn(() => chain),
  includeReference: vi.fn(() => chain),
  includeEmbeddedItems: vi.fn(() => chain),
  orderByDescending: vi.fn(() => chain),
  skip: vi.fn(() => chain),
  limit: vi.fn(() => chain),
  query: vi.fn(() => chain),
  find,
};

const entry = vi.fn(() => chain);
const contentType = vi.fn<(uid: string) => { entry: typeof entry }>(() => ({
  entry,
}));

vi.mock("./client", () => ({
  deliveryClient: {
    contentType: (uid: string) => contentType(uid),
  },
}));

const { findEntries, findEntryBySlug } = await import("./queries");

beforeEach(() => {
  vi.clearAllMocks();
  find.mockResolvedValue({ entries: [] });
});

describe("findEntries", () => {
  it("targets the given content type", async () => {
    await findEntries("blog_post");

    expect(contentType).toHaveBeenCalledWith("blog_post");
  });

  it("returns the entries from the response", async () => {
    find.mockResolvedValue({ entries: [{ uid: "a" }, { uid: "b" }] });

    await expect(findEntries("blog_post")).resolves.toEqual([
      { uid: "a" },
      { uid: "b" },
    ]);
  });

  it("returns an empty array when the response has no entries key", async () => {
    find.mockResolvedValue({});

    await expect(findEntries("blog_post")).resolves.toEqual([]);
  });

  it("applies only the options it is given", async () => {
    await findEntries("blog_post", { limit: 5 });

    expect(chain.limit).toHaveBeenCalledWith(5);
    expect(chain.skip).not.toHaveBeenCalled();
    expect(chain.locale).not.toHaveBeenCalled();
    expect(chain.orderByDescending).not.toHaveBeenCalled();
  });

  it("forwards locale, ordering and pagination", async () => {
    await findEntries("blog_post", {
      locale: "en-us",
      orderByDescending: "published_date",
      skip: 10,
      limit: 20,
      includeEmbeddedItems: true,
      includeReference: ["author"],
    });

    expect(chain.locale).toHaveBeenCalledWith("en-us");
    expect(chain.orderByDescending).toHaveBeenCalledWith("published_date");
    expect(chain.skip).toHaveBeenCalledWith(10);
    expect(chain.limit).toHaveBeenCalledWith(20);
    expect(chain.includeEmbeddedItems).toHaveBeenCalled();
    expect(chain.includeReference).toHaveBeenCalledWith(["author"]);
  });

  it("skips includeReference when the list is empty", async () => {
    await findEntries("blog_post", { includeReference: [] });

    expect(chain.includeReference).not.toHaveBeenCalled();
  });

  it("applies skip of zero, which is falsy but meaningful", async () => {
    await findEntries("blog_post", { skip: 0 });

    expect(chain.skip).toHaveBeenCalledWith(0);
  });

  it("passes a where filter to query()", async () => {
    await findEntries("page", { where: { url: "/about" } });

    expect(chain.query).toHaveBeenCalledWith({ url: "/about" });
  });

  it("does not call query() when no filter is given", async () => {
    await findEntries("page");

    expect(chain.query).not.toHaveBeenCalled();
  });

  it("combines a filter with ordering and pagination", async () => {
    await findEntries("page", {
      where: { url: "/about" },
      orderByDescending: "updated_at",
      limit: 1,
    });

    expect(chain.query).toHaveBeenCalledWith({ url: "/about" });
    expect(chain.orderByDescending).toHaveBeenCalledWith("updated_at");
    expect(chain.limit).toHaveBeenCalledWith(1);
  });
});

describe("findEntryBySlug", () => {
  it("queries by slug and takes a single entry", async () => {
    find.mockResolvedValue({ entries: [{ uid: "a", slug: "hello" }] });

    const result = await findEntryBySlug("blog_post", "hello");

    expect(chain.query).toHaveBeenCalledWith({ slug: "hello" });
    expect(chain.limit).toHaveBeenCalledWith(1);
    expect(result).toEqual({ uid: "a", slug: "hello" });
  });

  it("returns null when nothing matches", async () => {
    find.mockResolvedValue({ entries: [] });

    await expect(findEntryBySlug("blog_post", "missing")).resolves.toBeNull();
  });

  it("returns null when the response has no entries key", async () => {
    find.mockResolvedValue({});

    await expect(findEntryBySlug("blog_post", "missing")).resolves.toBeNull();
  });
});
