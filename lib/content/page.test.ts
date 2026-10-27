import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PageSection } from "./page";

const findEntries = vi.fn();

vi.mock("@/lib/contentstack", () => ({
  findEntries: (...args: unknown[]) => findEntries(...args),
}));

const {
  PAGE_CONTENT_TYPE,
  getPageByUrl,
  getPageUrls,
  normalizeSection,
  sectionUid,
  toPageUrl,
} = await import("./page");

beforeEach(() => {
  vi.clearAllMocks();
  findEntries.mockResolvedValue([]);
});

describe("toPageUrl", () => {
  it("maps an absent slug to the homepage", () => {
    expect(toPageUrl(undefined)).toBe("/");
    expect(toPageUrl([])).toBe("/");
  });

  it("joins a single segment", () => {
    expect(toPageUrl(["about"])).toBe("/about");
  });

  it("joins nested segments", () => {
    expect(toPageUrl(["services", "consulting"])).toBe("/services/consulting");
  });
});

describe("normalizeSection", () => {
  it("discriminates each known block", () => {
    const cases: Array<[PageSection, string]> = [
      [{ hero: { heading: "H" } }, "hero"],
      [{ rich_text: { content: null } }, "rich_text"],
      [{ feature_grid: { items: [] } }, "feature_grid"],
      [{ post_list: { limit: 3 } }, "post_list"],
    ];

    for (const [section, expected] of cases) {
      expect(normalizeSection(section)?.type).toBe(expected);
    }
  });

  it("keeps the block fields intact", () => {
    const result = normalizeSection({ hero: { heading: "Welcome" } });

    expect(result).toEqual({ type: "hero", fields: { heading: "Welcome" } });
  });

  it("returns null for a block the union does not cover", () => {
    const unknown = { cta_band: { heading: "Later" } } as unknown as PageSection;

    expect(normalizeSection(unknown)).toBeNull();
  });
});

describe("sectionUid", () => {
  it("uses the block metadata uid when present", () => {
    const section = normalizeSection({
      hero: { heading: "H", _metadata: { uid: "cs123" } },
    })!;

    expect(sectionUid(section, 0)).toBe("cs123");
  });

  it("falls back to type and index when metadata is missing", () => {
    const section = normalizeSection({ hero: { heading: "H" } })!;

    expect(sectionUid(section, 2)).toBe("hero-2");
  });
});

describe("getPageByUrl", () => {
  it("filters by the url field and resolves section references", async () => {
    await getPageByUrl("/about");

    expect(findEntries).toHaveBeenCalledWith(PAGE_CONTENT_TYPE, {
      includeEmbeddedItems: true,
      includeReference: ["sections.post_list.posts"],
      limit: 1,
      where: { url: "/about" },
    });
  });

  it("returns the first match", async () => {
    findEntries.mockResolvedValue([{ uid: "blt1", url: "/" }]);

    await expect(getPageByUrl("/")).resolves.toEqual({ uid: "blt1", url: "/" });
  });

  it("returns null when no page has that url", async () => {
    await expect(getPageByUrl("/missing")).resolves.toBeNull();
  });
});

describe("getPageUrls", () => {
  it("returns the url of every page", async () => {
    findEntries.mockResolvedValue([{ url: "/" }, { url: "/about" }]);

    await expect(getPageUrls()).resolves.toEqual(["/", "/about"]);
  });

  it("drops entries with an empty url", async () => {
    findEntries.mockResolvedValue([{ url: "/" }, { url: "" }, {}]);

    await expect(getPageUrls()).resolves.toEqual(["/"]);
  });
});
