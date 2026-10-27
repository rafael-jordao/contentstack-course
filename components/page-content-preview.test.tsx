import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Page } from "@/lib/content/page";

const getPageByUrl = vi.fn();
const getPageByUrlForPreview = vi.fn();

vi.mock("next/headers", () => ({
  draftMode: async () => ({ isEnabled: true }),
  headers: async () =>
    new Headers({
      "x-cs-live-preview": "hash-123",
      "x-cs-content-type-uid": "page",
      "x-cs-entry-uid": "blt_page",
    }),
}));

vi.mock("next/navigation", () => ({ notFound: () => { throw new Error("NEXT_NOT_FOUND"); } }));

vi.mock("@/lib/content/page", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content/page")>();

  return {
    ...actual,
    getPageByUrl: () => getPageByUrl(),
    getPageByUrlForPreview: (...args: unknown[]) => getPageByUrlForPreview(...args),
  };
});

const { PageContent } = await import("./page-content");

function buildPage(): Page {
  return {
    uid: "blt_page",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    title: "Home",
    url: "/",
    sections: [{ hero: { heading: "Draft heading" } }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  getPageByUrlForPreview.mockResolvedValue(buildPage());
});

describe("PageContent with draft mode enabled", () => {
  it("reads the preview adapter instead of the cached one", async () => {
    render(await PageContent({ params: Promise.resolve({}) }));

    expect(getPageByUrl).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Draft heading" })).toBeInTheDocument();
  });

  it("forwards the hash the proxy put on the request", async () => {
    await PageContent({ params: Promise.resolve({ slug: ["about-us"] }) });

    expect(getPageByUrlForPreview).toHaveBeenCalledWith("/about-us", {
      live_preview: "hash-123",
      content_type_uid: "page",
      entry_uid: "blt_page",
      preview_timestamp: undefined,
    });
  });
});
