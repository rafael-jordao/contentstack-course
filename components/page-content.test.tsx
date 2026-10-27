import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Page } from "@/lib/content/page";

const getPageByUrl = vi.fn();
const notFound = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("next/navigation", () => ({
  notFound: () => notFound(),
}));

vi.mock("@/lib/content/page", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/content/page")>();

  return { ...actual, getPageByUrl: (url: string) => getPageByUrl(url) };
});

const { PageContent } = await import("./page-content");

function buildPage(overrides: Partial<Page> = {}): Page {
  return {
    uid: "blt_page",
    locale: "en-us",
    created_at: "2026-10-27T00:00:00.000Z",
    updated_at: "2026-10-27T00:00:00.000Z",
    _version: 1,
    tags: [],
    title: "Home",
    url: "/",
    sections: [{ hero: { heading: "Welcome" } }],
    ...overrides,
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("PageContent", () => {
  it("resolves the homepage from an empty slug", async () => {
    getPageByUrl.mockResolvedValue(buildPage());

    render(await PageContent({ params: Promise.resolve({}) }));

    expect(getPageByUrl).toHaveBeenCalledWith("/");
    expect(screen.getByRole("heading", { name: "Welcome" })).toBeInTheDocument();
  });

  it("resolves a nested path from the slug segments", async () => {
    getPageByUrl.mockResolvedValue(buildPage({ url: "/services/consulting" }));

    await PageContent({
      params: Promise.resolve({ slug: ["services", "consulting"] }),
    });

    expect(getPageByUrl).toHaveBeenCalledWith("/services/consulting");
  });

  it("calls notFound when no page matches", async () => {
    getPageByUrl.mockResolvedValue(null);

    await expect(
      PageContent({ params: Promise.resolve({ slug: ["missing"] }) }),
    ).rejects.toThrow("NEXT_NOT_FOUND");

    expect(notFound).toHaveBeenCalled();
  });

  it("shows an error state instead of a 404 when the fetch fails", async () => {
    getPageByUrl.mockRejectedValue(new Error("service down"));

    render(await PageContent({ params: Promise.resolve({}) }));

    expect(screen.getByText("Could not load this page")).toBeInTheDocument();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("renders an empty page without sections", async () => {
    getPageByUrl.mockResolvedValue(buildPage({ sections: [] }));

    render(await PageContent({ params: Promise.resolve({}) }));

    expect(screen.queryByRole("heading")).toBeNull();
  });
});
